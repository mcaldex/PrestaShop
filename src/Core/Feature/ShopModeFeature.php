<?php
/**
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop SA
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to https://devdocs.prestashop.com/ for more information.
 *
 * @author    PrestaShop SA and Contributors <contact@prestashop.com>
 * @copyright Since 2007 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 */

namespace PrestaShop\PrestaShop\Core\Feature;

use PrestaShop\PrestaShop\Adapter\Configuration;
use PrestaShop\PrestaShop\Core\Feature\Enum\ShopModeEnum;
use Symfony\Component\HttpFoundation\Exception\UnexpectedValueException;

class ShopModeFeature
{
    public const CONFIGURATION_NAME = 'PS_SHOP_MODE';

    public const DEFAULT_SHOP_MODE = ShopModeEnum::SHOP_MODE_B2C_ONLY;

    public function __construct(
        protected readonly Configuration $configuration
    ) {
    }

    public function getCurrentShopMode(): ShopModeEnum
    {
        try {
            return $this->configuration->getEnum(self::CONFIGURATION_NAME, ShopModeEnum::class, self::DEFAULT_SHOP_MODE);
        } catch (UnexpectedValueException) {
            return ShopModeEnum::SHOP_MODE_B2C_ONLY;
        }
    }

    public function isB2BShopModeEnable(): bool
    {
        return match ($this->getCurrentShopMode()) {
            ShopModeEnum::SHOP_MODE_B2B_ONLY, ShopModeEnum::SHOP_MODE_B2B_AND_B2C => true,
            default => false,
        };
    }

    public function isB2CShopModeEnable(): bool
    {
        return match ($this->getCurrentShopMode()) {
            ShopModeEnum::SHOP_MODE_B2C_ONLY, ShopModeEnum::SHOP_MODE_B2B_AND_B2C => true,
            default => false,
        };
    }

    public function update(ShopModeEnum $shopModeEnum): void
    {
        $this->configuration->set(self::CONFIGURATION_NAME, $shopModeEnum->value);
    }
}
