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
*
*
*                             WARNING
*
*   do NOT MODIFY this template unless you modify javascript as well
*
*
*}
{strip}
{if $reviewsData.reviews.total > 0}
  {include file="./private_review_list.tpl" reviewsData=$reviewsData}
  {include file="./private_review_list_paging.tpl" reviewsData=$reviewsData}
  {if $reviewsData.canCreate}
    <div class="form-group">
      <a class="btn btn-primary">
        {l s='Write your review!' mod='revws'}
      </a>
    </div>
  {else}
    {if $reviewsData.visitor.type === 'guest'}
    <div class="form-group">
      <a class="btn btn-primary" href="{$reviewsData.loginUrl}">
        {l s='Sign in to write a review' mod='revws'}
      </a>
    </div>
    {/if}
  {/if}
{else}
  {if $reviewsData.canCreate}
    <div class="form-group">
      <a class="btn btn-primary">
        {l s='Be the first to write a review!' mod='revws'}
      </a>
    </div>
  {else}
    {if $reviewsData.visitor.type === 'guest' && $reviewsData.preferences.showSignInButton}
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
{/strip}
