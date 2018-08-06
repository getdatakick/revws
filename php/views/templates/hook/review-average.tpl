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
<div id="revws-product-{$placement}">
  <b>{l s='Rating' mod='revws'}:</b>
  {if $reviewCount > 0}
    <a class="revws-product-{$placement}-link" href="#idTabRevws">
      {include file='modules/revws/views/templates/widgets/grading/grading.tpl' grade=$grade shape=$shape type='product'}
      <div class="revws-count-text">
        {if $reviewCount == 1}
          {l s='(read one review)' mod='revws'}
        {else}
          {l s='(read %1$d reviews)' sprintf=[$reviewCount] mod='revws'}
        {/if}
      </div>
    </a>
  {else}
    {if $canReview}
      <a class="revws-product-{$placement}-link" href="#" data-revws-create-trigger="{$productId}">
        {l s='Be the first to write a review!' mod='revws'}
      </a>
    {else}
      {if $hasReviewed}
        {l s="Your review hasn't been approved yet" mod='revws'}
      {elseif $isGuest && $showSignInButton}
        <a class="revws-product-{$placement}-link" href="{$loginLink}">
          {l s='Sign in to write a review' mod='revws'}
        </a>
      {else}
        {l s='No customer reviews for the moment.' mod='revws'}
      {/if}
    {/if}
  {/if}
</div>
