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
{assign "hasReviewed" in_array($entityId, $visitor.reviewed[$entityType])}
{assign "canReview" !($visitor.type === 'guest' && !$reviewsData.preferences.allowGuestReviews) && !$hasReviewed}
{if $reviewList.total > 0}
  {include
    file='modules/revws/views/templates/widgets/review-list/list.tpl'
    reviewStyle='item'
    reviewList=$reviewList
    reviewsData=$reviewsData
    shopName=$reviewsData.shopName
    shape=$reviewsData.theme.shape
    criteria=$reviewsData.criteria
    displayCriteria=$reviewsData.preferences.displayCriteria
    microdata=$microdata
    allowPaging=$allowPaging
  }
  {if !$hasReviewed}
    {if $canReview}
      <div class="form-group">
        <a class="btn btn-primary" data-revws-entity-type="{$entityType}" data-revws-create-trigger="{$entityId}">
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
        <a class="btn btn-primary" data-revws-entity-type="{$entityType}" data-revws-create-trigger="{$entityId}">
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
{/strip}
