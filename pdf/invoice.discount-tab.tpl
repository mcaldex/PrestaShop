{**
 * For the full copyright and license information, please view the
 * docs/licenses/LICENSE.txt file that was distributed with this source code.
 *}
<table id="discount-tab" width="100%">
	<tr>
		<td class="discount center small grey bold" width="44%">{l s='Discount' d='Shop.Pdf' pdf='true'}</td>
		<td class="discount left white" width="56%">
			<table width="100%" border="0">
				{assign var="shipping_discount_tax_incl" value="0"}
				{foreach from=$cart_rules item=cart_rule name="cart_rules_loop"}
					<tr>
						<td class="right small">
							{$cart_rule.name}
						</td>
						<td class="right small">
							- {displayPrice currency=$order->id_currency price=$cart_rule.value_tax_excl}
						</td>
					</tr>
				{/foreach}
			</table>
		</td>
	</tr>
</table>
