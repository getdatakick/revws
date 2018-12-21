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
{strip}
{if $visitor.toReview.product}
<h1 class="page-heading">{l s='Could you review these products?' mod='revws'}</h1>
<div class='revws-review-requests'>
  {foreach from=$visitor.toReview.product item=productId}
    {if $productId@iteration <= $reviewsData.preferences.customerMaxRequests}
    {assign "product" $reviewEntities.product[$productId]}
    <div class='revws-review-request'>
      <img src="{$product.image}" />
      <h3 class='revws-review-request-name'>
        {$product.name|escape:'html':'UTF-8'}
      </h3>
    </div>
    {/if}
  {/foreach}
</div>
{/if}
<h1 class="page-heading">{l s='Your reviews' mod='revws'}</h1>
{if $reviewList.reviews}
  {include
    file='modules/revws/views/templates/widgets/review-list/list.tpl'
    reviewStyle='item-with-entity'
    reviewList=$reviewList
    displayCriteria=$reviewsData.preferences.displayCriteria
    shopName=$reviewsData.shopName
    shape=$reviewsData.theme.shape
    criteria=$reviewsData.criteria
    microdata=false
    allowPaging=true
  }
{else}
  <div className="form-group">
  {l s="You haven't written any review yet" mod='revws'}
</div>
{/if}
{/strip}
