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
.revws-hidden {
  display: none;
}

.revws-grading {
  display: flex;
  cursor: default;
  touch-action: none;
}
a .revws-grading {
  cursor: pointer;
}

.revws-grade-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.revws-grading-product .revws-grade-wrap {
  padding-left: {$cssSettings.shapeSize.product / 8}px;
  padding-right: {$cssSettings.shapeSize.product / 8}px;
}

.revws-grading-criterion .revws-grade-wrap {
  padding-left: {$cssSettings.shapeSize.product * 0.875 / 8}px;
  padding-right: {$cssSettings.shapeSize.product * 0.875 / 8}px;
}

.revws-grading-list .revws-grade-wrap {
  padding-left: {$cssSettings.shapeSize.list / 8}px;
  padding-right: {$cssSettings.shapeSize.list / 8}px;
}

.revws-grading-create .revws-grade-wrap {
  padding-left: {$cssSettings.shapeSize.create / 8}px;
  padding-right: {$cssSettings.shapeSize.create / 8}px;
}

.revws-grading-product .revws-grade {
  width: {$cssSettings.shapeSize.product}px;
  height: {$cssSettings.shapeSize.product}px;
}

.revws-grading-criterion .revws-grade {
  width: {$cssSettings.shapeSize.product * 0.875}px;
  height: {$cssSettings.shapeSize.product * 0.875}px;
}

.revws-grading-list .revws-grade {
  width: {$cssSettings.shapeSize.list}px;
  height: {$cssSettings.shapeSize.list}px;
}

.revws-grading-create .revws-grade {
  width: {$cssSettings.shapeSize.create}px;
  height: {$cssSettings.shapeSize.create}px;
}

.revws-grade {
  transition: all 200ms linear;
  stroke-width: {$cssSettings.shape.strokeWidth};
}

.revws-grade path {
  transition: fill 250ms ease;
}

.revws-grade-off path {
  fill: {$cssSettings.colors.fillColorOff};
  stroke: {$cssSettings.colors.borderColorOff};
}

.revws-grade-on path {
  fill: {$cssSettings.colors.fillColor};
  stroke: {$cssSettings.colors.borderColor};
}

.revws-grade-highlight path {
  fill: {$cssSettings.colors.fillColorHigh};
  stroke: {$cssSettings.colors.borderColorHigh};
}

/* review layout */
.revws-review-list {
  position: relative;
  overflow-x: auto;
}

.revws-loading {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background: white;
  opacity: 0.5;
}
.revws-loading-spinner {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center
}

.revws-under-review {
  color: red;
  font-size: 12px;
  margin-top: -10px;
}

.revws-review {
  position: relative;
  display: flex;
  flex-direction: row;
  margin: 10px 0px;
  padding: 10px;
  border-top: 1px solid #e5e5e5;
}

.revws-review:first-child {
  border-top: none;
}

.revws-review-author {
  min-width: {6 * ($cssSettings.shapeSize.list + $cssSettings.shapeSize.list/4)}px;
}

.revws-review-author-name {
  color: #222;
  font-size: 12px;
}

.revws-verified-buyer-badge {
  display: flex;
  margin-top: 5px;
  font-weight: 500;
  color: green;
  font-size: 12px;
  line-height: 16px;
}

.revws-verified-buyer-badge:before {
  content: '';
  background:url('../img/verified-buyer-badge.svg');
  width: 14px;
  height: 14px;
  margin-right: 5px;
  display: inline-block;
}

.revws-review-date {
  color: #999;
  font-size: 12px;
}

.revws-review-review {
  display: flex;
  justify-content: space-between;
}

.revws-review-box {
  width: 100%;
}

.revws-review-title {
  color: #222;
  font-weight: bold;
  font-size: 16px;
}

.revws-review-title a {
  cursor: pointer;
}

.revws-review-content {
  color: #666;
  padding: 10px 0px;
  font-size: 14px;
}

.revws-review-criteria {
  color: #999;
  font-size: 14px;
  font-weight: 400;
}

.revws-review-criteria-block {
  padding-left: 15px;
}

.revws-review-criteria-block table {
  border-spacing: 0;
  border-collapse: collapse;
}

.revws-review-criteria-block td {
  padding: 0px 10px;
}

.revws-review-criteria-inline {
  width: 100%;
  padding-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
}

.revws-review-criterion {
  display: flex;
}

.revws-review-criteria-inline .revws-criterion-label {
  margin-right: 10px;
}

.revws-review-criteria-inline .revws-review-criterion:not(:last-child) {
  border-right: 1px solid #f5f5f5;
  padding-right: 20px;
  margin-right: 20px;
}

.revws-actions {
  display: flex;
  color: #999;
  font-size: 12px;
}

.revws-actions .btn {
  color: #999;
  font-size: 12px;
  padding: 3px 6px;
}

.revws-actions .btn:hover {
  color: #222;
  text-decoration: none;
}

.revws-actions .revws-report:first-child .btn,
.revws-actions .revws-delete:first-child .btn {
  padding-left: 0px;
}

.revws-action:not(:last-child) {
  border-right: 1px solid #f5f5f5;
  padding-right: 10px;
  margin-right: 10px;
}

.revws-paging {
  display: flex;
  flex-direction: row;
  justify-content: center;
  height: 48px;
}

.revws-page-prev, .revws-page-next {
  cursor: pointer;
  width: 48px;
  height: 48px;
}

.revws-page-prev svg, .revws-page-next svg {
  margin: 12px;
  fill: rgba(0, 0, 0, 0.54);
}

.revws-disabled svg {
  fill: rgba(0, 0, 0, 0.26);
}

/* product extra - right panel */
 #revws-product-extra,
 #revws-product-buttons,
 .revws-product-extra-link,
 .revws-product-buttons-link {
  display: flex;
  flex-direction: row;
  align-items: center;
}

#revws-product-extra b,
#revws-product-buttons b,
.revws-product-list .revws-grading,
.revws-comparison .revws-grading,
.revws-product-buttons-link .revws-grading,
.revws-product-extra-link .revws-grading {
  margin-right: 10px;
  flex-grow: 0;
  flex-shrink: 0;
}

.revws-count-text {
  flex-grow: 1;
  flex-shrink: 1;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: left;
}

.revws-product-list, .revws-product-list a, .revws-comparison {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.revws-product-list a {
  max-width: 100%;
  overflow: hidden;
}

.revws-product-list-empty {
  {if $cssSettings.productList.noReviews == 'omit'}
  display: none;
  {elseif $cssSettings.productList.noReviews == 'hide'}
  opacity: 0;
  {/if}
}

.revws-replies {
  width: 100%;
  padding: 20px;
  background-color: #EBF3F8;
  margin-top: 10px;
  font-size: 90%;
  color: #777;
}

.revws-reply-title {
  font-weight: 500;
  color: #444;
  margin-bottom: 10px;
}

.revws-review-with-product {
  display: flex;
  margin-bottom: 40px;
  padding-left: 20px;
  padding-right: 20px;
}

.revws-review-with-product .revws-review-wrapper {
  flex-shrink: 1;
  flex-grow: 1;
}

.revws-review-with-product img {
  max-width: 200px;
  padding-right: 40px;
  flex-shrink: 0;
  flex-grow: 0;
}

.revws-review-with-product .revws-review {
  margin-top: 30px;
  border: 1px solid #f5f5f5;
}

.revws-review-requests {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  padding: 40px;
}

.revws-review-request {
  padding: 20px;
  cursor: pointer;
  transition: all 350ms ease;
  transform: scale(0.9);
}

.revws-review-request:hover {
  box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px;
  transform: scale(1);
}

.revws-review-request-name {
  margin-top: 10px;
  text-align: center;
}

@media (min-width: 768px) {
  .revws-review-author {
    width: 20%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .revws-review .revws-grading-product {
    margin: 20px 0px;
  }

  .revws-review-details {
    width: 80%;
    border-left: 1px solid #f5f5f5;
    padding-left: 30px;
  }
}

@media (max-width: 768px) {
  .revws-review {
    flex-direction: column;
  }
  .revws-review-author {
    width: 100%;
    display: flex;
    flex-direction: row;
  }
  .revws-review-details {
    width: 100%;
  }
  .revws-review .revws-grading-product {
    margin: 0px 20px;
  }
  .revws-review .revws-verified-buyer-badge {
    margin: 0px 5px;
  }
  .revws-review-details {
    margin: 30px 0px;
  }
  .revws-review-content {
    margin-top: 10px;
  }
  .revws-review-review {
    flex-direction: column;
  }
  .revws-review-criteria {
    padding: 20px 0px;
  }
  .revws-review-criteria .revws-criterion-label {
    padding-left: 0px;
  }
  .revws-review-with-product {
    flex-wrap: wrap;
    justify-content: center;
  }
  .revws-review-with-site img,
  .revws-review-with-product img {
    padding-right: 0;
  }
  .revws-review-entity-name {
    text-align: center;
  }
}

.revws-reset label {
  text-align: left;
}

.revws-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.revws-dialog h2 {
  padding-bottom: 3rem;
  font-size: 1.5em;
  color: #999;
}

.revws-product-image  {
  max-width: 250px;
  max-height: 250px;
}

.revws-product-image-small  {
  max-width: 150px;
  max-height: 150px;
}

.revws-dialog-slides-wrapper {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.revws-dialog-slides {
  display: flex;
  position: relative;
  transition: left 300ms ease;
  top: 0px;
  left: 0px;
}

.revws-dialog-slide {
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  display: flex;
  overflow: hidden;
  text-align: center;
}

.revws-dots {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.revws-dot {
  width: 6px;
  height: 6px;
  margin: 0 5px;
  padding: 5px;
  cursor: pointer;
}

.revws-dot::after {
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #ddd;
  transition: box-shadow 0.5s;
}

.revws-dot:hover::after,
.revws-dot:focus::after,
.revws-dot-active::after,
.revws-dot-active:hover::after,
.revws-dot-action:focus::after {
  box-shadow: 0 0 0 2px #ddd;
}

.revws-review-form .revws-review-form-input {
  margin-top: 3rem;
}

.revws-review-form .revws-review-form-criterion {
  display: flex;
  flex-direction: row;
}

.revws-review-form-criterion-label {
  margin-right: 1rem;
  font-weight: bold;
  color: #999;
  width: 120px;
  overflow-x: hidden;
  text-overflow: ellipsis;
}

.revws-review-form-author {
  color: #999;
  margin-bottom: 1rem;
}
.revws-review-form-author a {
  cursor: pointer;
  color: #666;
}
.revws-review-form-author a:hover {
  color: #222;
  text-decoration: underline;
}

.revws-review-form-author-input {
  margin-bottom: 1rem;
}

.revws-review-form-consent {
  color: #999;
}
.revws-review-form-consent * {
  margin: 0;
  padding: 0;
}

.revws-review-form-image-text {
  font-size: 1.2rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  color: #999;
  cursor: pointer;
  font-weight: normal;
}
.revws-review-form-image-text:before {
  content: "\f0c6";
  font-size: 1.5rem;
  font-family: FontAwesome;
  padding-right: 5px;
}

.revws-review-form-image-text:hover {
  color: #222;
}


.revws-images {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 10px -10px 0px -10px;
}

.revws-image {
  margin: 10px;
  width: {$cssSettings.images.thumbnail.width + 20}px;
  height: {$cssSettings.images.thumbnail.height + 20}px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #f5f5f5;
  transition: all 250ms linear;
}

.revws-image:hover {
  border: 1px solid #222;
  opacity: 0.8;
  cursor: pointer;
}

.revws-image img {
  max-width: {$cssSettings.images.thumbnail.width}px;
  max-height: {$cssSettings.images.thumbnail.height}px;
  padding: 0px;
}

.revws-image svg {
  stroke: #aaa;
  fill: #aaa;
}

.revws-entity-image-wrapper {
    display: flex;
    align-items: center;
}

.revws-review-entity-name a {
  text-decoration: none;
}

.revws-review-entity-name a:hover {
  text-decoration: underline;
}
