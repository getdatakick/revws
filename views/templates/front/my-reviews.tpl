{capture name=path}
  <a href="{$link->getPageLink('my-account', true)|escape:'html':'UTF-8'}">
    {l s='My account' mod='revws'}
  </a>
  <span class="navigation-pipe">
    {$navigationPipe}
  </span>
  <span class="navigation_page">
    {l s='My reviews' mod='revws'}
  </span>
{/capture}

<div id="myreviews">
  <div id="revws-tab-content">
    <div id="revws-app">
      {include file="./private_my_review_list.tpl" reviewsData=$reviewsData}
    </div>
  </div>
</div>

<nav>
  <ul class="pager">
    <li class="previous">
      <a href="{$link->getPageLink('my-account', true)|escape:'html':'UTF-8'}" title="{l s='Back to your account' mod='revws'}">&larr; {l s='Back to your account' mod='revws'}</a>
    </li>
  </ul>
</nav>

{addJsDef revwsData=$reviewsData}
