{*
* Copyright (C) 2017-2023 Petr Hucik <petr@getdatakick.com>
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
* @copyright 2017-2023 Petr Hucik
* @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*}
{if $reviewCount>0 || !$omitEmpty}
<div class="revws-product-list{if $reviewCount == 0} revws-product-list-empty{/if}">
  <a href="{$reviewsUrl}">
    {include file='../helpers/grading.tpl' grade=$grade shape=$shape type='list'}
    <div class="revws-count-text">
      {if $reviewCount == 1}
        {l s='one review' mod='revws'}
      {else}
        {l s='%1$d reviews' sprintf=[$reviewCount] mod='revws'}
      {/if}
    </div>
  </a>
</div>
{/if}
