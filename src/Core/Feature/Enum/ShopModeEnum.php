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

namespace PrestaShop\PrestaShop\Core\Feature\Enum;

use Symfony\Contracts\Translation\TranslatableInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

enum ShopModeEnum: string implements TranslatableInterface
{
    case SHOP_MODE_B2C_ONLY = 'b2c_only';
    case SHOP_MODE_B2B_ONLY = 'b2b_only';
    case SHOP_MODE_B2B_AND_B2C = 'b2b_and_b2c';

    public function trans(TranslatorInterface $translator, ?string $locale = null): string
    {
        return match ($this) {
            self::SHOP_MODE_B2C_ONLY => $translator->trans('B2C only', [], 'Admin.Shopparameters.Feature', $locale),
            self::SHOP_MODE_B2B_ONLY => $translator->trans('B2B only', [], 'Admin.Shopparameters.Feature', $locale),
            self::SHOP_MODE_B2B_AND_B2C => $translator->trans('B2B and B2C', [], 'Admin.Shopparameters.Feature', $locale),
        };
    }
}
