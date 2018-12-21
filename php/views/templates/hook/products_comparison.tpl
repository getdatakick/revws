{*
* Copyright (C) 2017-2018 Petr Hucik <petr@getdatakick.com>
*
* NOTICE OF LICENSE
*
* This source file is subject to the Academic Free License (AFL 3.0)
* that is bundled with this package in the file LICENSE.txt.
* It is also available through the world-wide-web at this URL:
* http://opensource.org/licenses/afl-3.0.php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to license@getdatakick.com so we can send you a copy immediately.
*
* @author    Petr Hucik <petr@getdatakick.com>
* @copyright 2017-2018 Petr Hucik
* @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*}
<tr class="comparison_header active">
  <td><b>{l s='Reviews' mod='revws'}</b></td>
  {foreach from=$list_ids_product item=productId}
    <td class='comparison_infos'>
      <div class="revws-comparison">
        {assign "grade" $averages[$productId][0]}
        {assign "count" $averages[$productId][1]}
        {if $count == 0}
          {l s='no review' mod='revws'}
        {else}
          {include file='modules/revws/views/templates/helpers/grading.tpl' grade=$grade shape=$shape type='list'}
          <div class="revws-count-text">
            {if $count == 1}
              {l s='one review' mod='revws'}
            {else}
              {l s='%1$d reviews' sprintf=[$count] mod='revws'}
            {/if}
          </div>
        {/if}
      </div>
    </td>
  {/foreach}
</tr>
