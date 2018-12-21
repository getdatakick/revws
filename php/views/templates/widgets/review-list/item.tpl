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
{assign "showCriteria" count($review.grades) > 1}
{strip}
<div class="revws-review {if $review.underReview}revws-review-under-review {/if}{if $review.verifiedBuyer}revws-verified-buyer {/if}" {if $microdata}itemprop="review" itemscope itemtype="http://schema.org/Review"{/if}>
  <div class="revws-review-author">
    <div class="revws-review-author-name" {if $microdata}itemprop="author"{/if}>{$review.displayName|escape:'html':'UTF-8'}</div>
    {if $review.verifiedBuyer}
      <div class="revws-verified-buyer-badge">{l s="Verified purchase" mod='revws'}</div>
    {/if}
    {if count($review.grades) > 0}
      {include file='modules/revws/views/templates/helpers/grading.tpl' grade=$review.grade shape=$shape type='product'}
      {if $microdata}
        <div class="revws-hidden" itemprop="reviewRating" itemscope itemtype="http://schema.org/Rating">
          <meta itemprop="worstRating" content="1">
          <meta itemprop="ratingValue" content="{$review.grade|string_format:"%.2f"}">
          <meta itemprop="bestRating" content="5">
        </div>
      {/if}
    {/if}
    <div class="revws-review-date" {if $microdata}itemprop="datePublished" content="{$review.date|date_format:"%Y-%m-%d"}"{/if}>{dateFormat date=$review.date|escape:'html':'UTF-8' full=0}</div>
  </div>

  <div class="revws-review-details">
    <div class="revws-review-review">
      <div class="revws-review-box">
        {if $showCriteria && $displayCriteria === 'inline'}
        <div class="revws-review-criteria revws-review-criteria-inline">
          {foreach from=$review.grades item=critValue key=critKey}
          {if isset($criteria[$critKey])}
          <div class='revws-review-criterion'>
            <span class='revws-criterion-label'>{$criteria[$critKey].label}</span>
            {include file='modules/revws/views/templates/helpers/grading.tpl' grade=$critValue shape=$shape type='criterion'}
          </div>
          {/if}
          {/foreach}
        </div>
        {/if}
        <p class="revws-review-title" {if $microdata}itemprop="name"{/if}>
          {if isset($linkToProduct) && $linkToProduct}
          <a href="{$linkToProduct}">{$review.title}</a>
          {else}
          {$review.title}
          {/if}
        </p>
        {if $review.underReview}
        <div class="revws-under-review">{l s="This review hasn't been approved yet" mod='revws'}</div>
        {/if}
        <p class="revws-review-content" {if $microdata}itemprop="description"{/if}>{$review.content|escape:'html':'UTF-8'|nl2br}</p>
      </div>
      {if $showCriteria && $displayCriteria === 'side'}
      <div class="revws-review-criteria revws-review-criteria-block">
        <table>
          <tbody>
            {foreach from=$review.grades item=critValue key=critKey}
            {if isset($criteria[$critKey])}
            <tr>
              <td class="revws-criterion-label">{$criteria[$critKey].label}</td>
              <td class="revws-criterion-value">
                {include file='modules/revws/views/templates/helpers/grading.tpl' grade=$critValue shape=$shape type='criterion'}
              </td>
            </tr>
            {/if}
            {/foreach}
          </tbody>
        </table>
      </div>
      {/if}
    </div>
    {if $review.images}
    <div class="revws-images">
      {foreach from=$review.images item=image }
      <a href="{$image}">
        <div class="revws-image">
          <img src="{str_replace(".jpg", ".thumb.jpg", $image)}" />
        </div>
      </a>
      {/foreach}
    </div>
    {/if}
    <div class="revws-actions">
      {if $review.canVote}
        <div class="revws-action revws-useful">{l s='Was this comment useful to you?' mod='revws'}
          <a class="btn btn-xs btn-link">
            <i class="icon icon-thumbs-up"></i> {l s='Yes' mod='revws'}
          </a>
          <a class="btn btn-xs btn-link">
            <i class="icon icon-thumbs-down"></i> {l s='No' mod='revws'}
          </a>
        </div>
      {/if}
      {if $review.canReport}
        <div class="revws-action revws-report">
          <a class="btn btn-xs btn-link">
            <i class="icon icon-flag"></i> {l s='Report abuse' mod='revws'}
          </a>
        </div>
      {/if}
      {if $review.canEdit}
        <div class="revws-action revws-edit">
          <a class="btn btn-xs btn-link">
            <i class="icon icon-edit"></i> {l s='Edit review' mod='revws'}
          </a>
        </div>
      {/if}
      {if $review.canDelete}
        <div class="revws-action revws-delete">
          <a class="btn btn-xs btn-link">
            <i class="icon icon-remove"></i> {l s='Delete review' mod='revws'}
          </a>
        </div>
      {/if}
    </div>
    {if isset($shopName) && $review.reply}
      <div class="revws-replies">
        <div class="revws-reply">
          <div class="revws-reply-title">
            {l s='Reply from %s:' sprintf=[$shopName] mod='revws'}
          </div>
          <div class="revws-reply-content">
            {$review.reply|escape:'html':'UTF-8'|nl2br}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
{/strip}
