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
{if $reviewsData.preferences.microdata && $reviewCount>0 && $avgGrade > 0}
<div class="revws-hidden" itemprop="aggregateRating" itemscope itemtype="http://schema.org/AggregateRating">
  Rated <span itemprop="ratingValue">{$avgGrade|string_format:"%.2f"}</span> on the scale <span itemProp="worstRating">1</span> - <span itemprop="bestRating">5</span> based on <span itemprop="reviewCount">{$reviewCount}</span> customer reviews
</div>
{/if}
<div id="revws-portal-{$reviewList.id}">
{assign "hasReviewed" in_array($productId, $visitor.reviewedProducts)}
{assign "canReview" !($visitor.type === 'guest' && !$reviewsData.preferences.allowGuestReviews) && !$hasReviewed}
{if $reviewList.total > 0}
  {include
    file='modules/revws/views/templates/widgets/list/list.tpl'
    reviewStyle='item'
    reviewList=$reviewList
    reviewsData=$reviewsData
    shopName=$reviewsData.shopName
    shape=$reviewsData.theme.shape
    criteria=$reviewsData.criteria
    displayCriteria=$reviewsData.preferences.displayCriteria
    microdata=$reviewsData.preferences.microdata
    allowPaging=true
  }
  {if !$hasReviewed}
    {if $canReview}
      <div class="form-group">
        <a class="btn btn-primary" data-revws-create-trigger="{$productId}">
          {l s='Write your review!' mod='revws'}
        </a>
      </div>
    {else}
      {if $visitor.type === 'guest'}
      <div class="form-group">
        <a class="btn btn-primary" href="{$reviewsData.loginUrl}">
          {l s='Sign in to write a review' mod='revws'}
        </a>
      </div>
      {/if}
    {/if}
  {/if}
{else}
  {if !$hasReviewed}
    {if $canReview}
      <div class="form-group">
        <a class="btn btn-primary" data-revws-create-trigger="{$productId}">
          {l s='Be the first to write a review!' mod='revws'}
        </a>
      </div>
    {else}
      {if $visitor.type === 'guest' && $reviewsData.preferences.showSignInButton}
        <div class="form-group">
          <a class="btn btn-primary" href="{$reviewsData.loginUrl}">
            {l s='Sign in to write a review' mod='revws'}
          </a>
        </div>
      {else}
        <div class="form-group">{l s='No customer reviews for the moment.' mod='revws'}</div>
      {/if}
    {/if}
  {/if}
{/if}
</div>
<div class="revws-hidden">
  <a href="{$allReviewsUrl}">{l s='Reviews' mod='revws'}</a>
</div>
{/strip}
