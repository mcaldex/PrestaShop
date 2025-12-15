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

declare(strict_types=1);

namespace PrestaShop\PrestaShop\Adapter\Shipment;

use Order;
use PrestaShop\PrestaShop\Adapter\LegacyContext;
use PrestaShop\PrestaShop\Adapter\Order\Repository\OrderDetailRepository;
use PrestaShop\PrestaShop\Adapter\Order\Repository\OrderRepository;
use PrestaShop\PrestaShop\Adapter\Tools;
use PrestaShop\PrestaShop\Core\Domain\Order\ValueObject\OrderId;
use PrestaShop\PrestaShop\Core\Domain\Shipment\ValueObject\OrderDetailId;

class ShipmentTotalsCalculator implements ShipmentTotalsCalculatorInterface
{
    public function __construct(
        private OrderRepository $orderRepository,
        private OrderDetailRepository $orderDetailRepository,
        private LegacyContext $context,
        private Tools $tools,
    ) {
    }

    public function calculate(int $orderDetailId, int $quantity): array
    {
        $orderDetail = $this->orderDetailRepository->get(new OrderDetailId($orderDetailId));
        $order = $this->orderRepository->get(new OrderId($orderDetail->id_order));
        $precision = $this->context->getContext()->getComputingPrecision();

        switch ($order->round_type) {
            case Order::ROUND_TOTAL:
                $totalTaxIncl = $orderDetail->unit_price_tax_incl * $quantity;
                $totalTaxExcl = $orderDetail->unit_price_tax_excl * $quantity;
                break;

            case Order::ROUND_LINE:
                $totalTaxIncl = $this->tools->round(
                    $orderDetail->unit_price_tax_incl * $quantity,
                    $precision,
                    $order->round_mode
                );
                $totalTaxExcl = $this->tools->round(
                    $orderDetail->unit_price_tax_excl * $quantity,
                    $precision,
                    $order->round_mode
                );
                break;

            case Order::ROUND_ITEM:
            default:
                $totalTaxIncl = $this->tools->round(
                    $orderDetail->unit_price_tax_incl,
                    $precision,
                    $order->round_mode
                ) * $quantity;

                $totalTaxExcl = $this->tools->round(
                    $orderDetail->unit_price_tax_excl,
                    $precision,
                    $order->round_mode
                ) * $quantity;
                break;
        }

        return [$totalTaxExcl, $totalTaxIncl];
    }
}
