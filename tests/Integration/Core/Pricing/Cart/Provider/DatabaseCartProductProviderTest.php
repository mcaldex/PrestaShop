<?php
/**
 * For the full copyright and license information, please view the
 * docs/licenses/LICENSE.txt file that was distributed with this source code.
 */

declare(strict_types=1);

namespace Tests\Integration\Core\Pricing\Cart\Provider;

use Doctrine\DBAL\Connection;
use PrestaShop\PrestaShop\Core\Pricing\Cart\Provider\CartProductDTO;
use PrestaShop\PrestaShop\Core\Pricing\Cart\Provider\DatabaseCartProductProvider;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class DatabaseCartProductProviderTest extends KernelTestCase
{
    protected DatabaseCartProductProvider $provider;
    protected Connection $connection;
    protected string $dbPrefix;

    protected function setUp(): void
    {
        parent::setUp();
        self::bootKernel();

        /* @var Connection $connection */
        $this->connection = self::getContainer()->get('doctrine.dbal.default_connection');
        $this->dbPrefix = self::getContainer()->getParameter('database_prefix');

        $this->provider = new DatabaseCartProductProvider($this->connection, $this->dbPrefix);
    }

    public function testReturnsEmptyArrayForNonExistentCart(): void
    {
        $products = $this->provider->getCartProducts(999999);

        $this->assertSame([], $products);
    }

    public function testReturnsCartProductDTOs(): void
    {
        // Create a temporary cart and cart_product entry for testing
        $this->connection->executeStatement(
            'INSERT INTO ' . $this->dbPrefix . 'cart (id_currency, id_lang) VALUES (1, 1)'
        );
        $cartId = (int) $this->connection->lastInsertId();

        $this->connection->executeStatement(
            'INSERT INTO ' . $this->dbPrefix . 'cart_product (id_cart, id_product, id_product_attribute, quantity, id_address_delivery, id_shop) VALUES (:cartId, 1, 0, 3, 0, 1)',
            ['cartId' => $cartId]
        );

        try {
            $products = $this->provider->getCartProducts($cartId);

            $this->assertCount(1, $products);
            $this->assertInstanceOf(CartProductDTO::class, $products[0]);
            $this->assertSame(1, $products[0]->getProductId());
            $this->assertSame(0, $products[0]->getCombinationId());
            $this->assertSame(3, $products[0]->getQuantity());
        } finally {
            // Cleanup
            $this->connection->executeStatement(
                'DELETE FROM ' . $this->dbPrefix . 'cart_product WHERE id_cart = :cartId',
                ['cartId' => $cartId]
            );
            $this->connection->executeStatement(
                'DELETE FROM ' . $this->dbPrefix . 'cart WHERE id_cart = :cartId',
                ['cartId' => $cartId]
            );
        }
    }
}
