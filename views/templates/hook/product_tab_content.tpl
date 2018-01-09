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
<div id="revws-tab-content">
  {if !empty($reviewsData.reviews)}

    {foreach from=$reviewsData.reviews item=review}
      <div class="revws-review row no-gutter">
        <div class="col-sm-3 col-md-2">
          <div class="revws-review-author">
            <div class="revws-review-author-name">{$review.displayName|escape:'html':'UTF-8'}</div>
            {include file='./grading.tpl' grade=$review.grade shape=$reviewsData.theme.shape}
            <div class="revws-review-date">{dateFormat date=$review.date|escape:'html':'UTF-8' full=0}</div>
          </div>
        </div>

        <div class="col-sm-9 col-md-10">
          <div class="revws-review-details">
            <p class="revws-review-title">{$review.title}</p>
            {if $review.underReview}
            <div class="revws-under-review">{l s="This review hasn't been approved yet" mod='revws'}</div>
            {/if}
            <p class="revws-review-content">{$review.content|escape:'html':'UTF-8'|nl2br}</p>
            <div class="revws-actions">
              {if $review.canVote}
                <div class="revws-action revws-useful">
                  {l s='Was this comment useful to you?' mod='revws'}
                  <a class="btn btn-xs btn-link" data-revws-vote-trigger="{$review.id}" data-revws-direction="1">
                    <i class="icon icon-thumbs-up"></i> {l s='Yes' mod='revws'}
                  </a>
                  <a class="btn btn-xs btn-link" data-revws-vote-trigger="{$review.id}" data-revws-direction="0">
                    <i class="icon icon-thumbs-down"></i> {l s='No' mod='revws'}
                  </a>
                </div>
              {/if}
              {if $review.canReport}
                <div class="revws-action revws-report">
                  <a class="btn btn-xs btn-link" data-revws-report-trigger="{$review.id}">
                    <i class="icon icon-flag"></i> {l s='Report abuse' mod='revws'}
                  </a>
                </div>
              {/if}
              {if $review.canEdit}
                <div class="revws-action revws-edit">
                  <a class="btn btn-xs btn-link" data-revws-edit-trigger="{$review.id}">
                    <i class="icon icon-edit"></i> {l s='Edit review' mod='revws'}
                  </a>
                </div>
              {/if}
              {if $review.canDelete}
                <div class="revws-action revws-delete">
                  <a class="btn btn-xs btn-link" data-revws-delete-trigger="{$review.id}">
                    <i class="icon icon-remove"></i> {l s='Delete review' mod='revws'}
                  </a>
                </div>
              {/if}
            </div>
          </div>
        </div>

      </div>
    {/foreach}

    {if $reviewsData.permissions.create}
      <div class="form-group">
        <a class="btn btn-primary" href="#" data-revws-create-trigger="{$reviewsData.productId}">
          {l s='Write your review!' mod='revws'}
        </a>
      </div>
    {/if}

  {else}
    {if $reviewsData.permissions.create}
      <div class="form-group">
        <a class="btn btn-primary" href="#" data-revws-create-trigger="{$reviewsData.productId}">
          {l s='Be the first to write review!' mod='revws'}
        </a>
      </div>
    {else}
      <div class="form-group">{l s='No customer reviews for the moment.' mod='revws'}</div>
    {/if}
  {/if}
</div>

{strip}
  {addJsDef revwsData=$reviewsData}
{/strip}
