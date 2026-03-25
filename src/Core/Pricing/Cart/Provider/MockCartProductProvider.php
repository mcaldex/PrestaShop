<?php
/**
 * For the full copyright and license information, please view the
 * docs/licenses/LICENSE.txt file that was distributed with this source code.
 */

declare(strict_types=1);

namespace PrestaShop\PrestaShop\Core\Pricing\Cart\Provider;

/**
 * In-memory cart product provider for unit tests. Accepts pre-configured arrays
 * of CartProductDTO keyed by cartId.
 */
class MockCartProductProvider implements CartProductProviderInterface
{
    /**
     * @param array<int, CartProductDTO[]> $cartProductsMap keyed by cartId
     */
    public function __construct(
        protected readonly array $cartProductsMap = [],
    ) {
    }

    /**
     * @return CartProductDTO[]
     */
    public function getCartProducts(int $cartId): array
    {
        return $this->cartProductsMap[$cartId] ?? [];
    }
}
