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
  {include
    file='modules/revws/views/templates/widgets/my-reviews/my-reviews.tpl'
    reviewsData=$reviewsData
    reviewList=$reviewList
    reviewEntities=$reviewEntities
    visitor=$visitor
  }
</div>

<nav>
  <ul class="pager">
    <li class="previous">
      <a href="{$link->getPageLink('my-account', true)|escape:'html':'UTF-8'}" title="{l s='Back to your account' mod='revws'}">&larr; {l s='Back to your account' mod='revws'}</a>
    </li>
  </ul>
</nav>
