{*
* Copyright (C) 2017 Petr Hucik <petr@getdatakick.com>
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
* @copyright 2018 Petr Hucik
* @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*}
<div id="revws-product-extra">
  <b>{l s='Rating' mod='revws'}:</b>
    {if $reviewCount > 0}
      <a class="revws-product-extra-link" href="#revws-tab-content">
        {include file='./grading.tpl' grade=$grade shape=$shape}
        {l s='(read %1$d reviews)' sprintf=[$reviewCount] mod='revws'}
      </a>
    {else}
      <a class="revws-product-extra-link" href="#" data-revws-create-trigger="{$productId}">
        {l s='Be the first to write review!' mod='revws'}
      </a>
    {/if}
</div>
