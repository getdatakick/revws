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
<div id="revws-tab-content">
  {if $reviewsData.reviews.total > 0}
    <div class="revws-review-list">
    {foreach from=$reviewsData.reviews.reviews item=review}
      <div class="revws-review row no-gutter">
        <div class="col-sm-3 col-md-2">
          <div class="revws-review-author">
            <div class="revws-review-author-name">{$review.displayName|escape:'html':'UTF-8'}</div>
            {if count($review.grades) > 0}
            {include file='./grading.tpl' grade=$review.grade shape=$reviewsData.theme.shape size=$reviewsData.theme.shapeSize.product}
            {/if}
            <div class="revws-review-date">{dateFormat date=$review.date|escape:'html':'UTF-8' full=0}</div>
          </div>
        </div>

        <div class="col-sm-9 col-md-10">
          <div class="revws-review-details">
            <p class="revws-review-title">
              {$review.title}
            </p>
            {if $review.underReview}
            <div class="revws-under-review">{l s="This review hasn't been approved yet" mod='revws'}</div>
            {/if}
            <p class="revws-review-content">{$review.content|escape:'html':'UTF-8'|nl2br}</p>
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
            {if $review.reply}
              <div class="revws-replies">
                <div class="revws-reply">
                  <div class="revws-reply-content">
                    {$review.reply|escape:'html':'UTF-8'|nl2br}
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/foreach}
    </div>
    {if $reviewsData.reviews.pages > 1}
    <div class="revws-paging">
      <div class="revws-page-prev revws-disabled">
        <svg width="24" height="24" focusable="false" viewBox="0 0 24 24">
          <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"></path>
        </svg>
      </div>
      <div class="revws-page-next">
        <svg width="24" height="24" focusable="false" viewBox="0 0 24 24">
          <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"></path>
        </svg>
      </div>
    </div>
    {/if}

    {if $reviewsData.permissions.create}
      <div class="form-group">
        <a class="btn btn-primary">
          {l s='Write your review!' mod='revws'}
        </a>
      </div>
    {/if}

  {else}
    {if $reviewsData.permissions.create}
      <div class="form-group">
        <a class="btn btn-primary">
          {l s='Be the first to write review!' mod='revws'}
        </a>
      </div>
    {else}
      <div class="form-group">{l s='No customer reviews for the moment.' mod='revws'}</div>
    {/if}
  {/if}
</div>

{addJsDef revwsData=$reviewsData}
{/strip}
