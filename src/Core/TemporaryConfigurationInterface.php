<?php
/**
 * For the full copyright and license information, please view the
 * docs/licenses/LICENSE.txt file that was distributed with this source code.
 */

namespace PrestaShop\PrestaShop\Core;

/**
 * @deprecated This interface is a temporary workaround to avoid a BC break.
 *             The setTemporary() method should be moved into ConfigurationInterface in PrestaShop version 10.
 */
interface TemporaryConfigurationInterface
{
    /**
     * Set a configuration value in memory only, without persisting to database.
     * Use this for temporary flags scoped to the current process.
     *
     * @param string $key
     * @param mixed $value
     */
    public function setTemporary(string $key, $value): void;
}
