(function revwsBootstrap() {
  if (! window.revwsData) {
    setTimeout(revwsBootstrap, 1000);
    return;
  }
  var tag = document.createElement('script');
  tag.src = window.revwsData.settings.appJsUrl;
  tag.setAttribute('defer', '');
  tag.setAttribute('async', '');
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // returns true, if reviews are displayed in tab.
  var displayedInTab = function() {
    return (window.revwsData && window.revwsData.settings.preferences.placement === 'tab');
  }

  if (! window.revws) {
    window.revws = function(action) {
      if (window.revwsData) {
        console.info('revws not loaded yet');
        window.revwsData.initActions = window.revwsData.initActions || [];
        window.revwsData.initActions.push(action);
      }
    }
  }

  var warn = function(msg) {
    if (console.warn) {
      console.warn(msg);
    }
    return false;
  }

  /**
   * this function will not work on all themes. Change it if you use tabs,
   * and reviews tab will not open automatically when you click on 'read reviews'
   */
  var openTab = function() {
    var $elem = $("#idTabRevws");
    if (! $elem.length) {
      return warn("Can't find #idTabRevws");
    }

    var id = $elem.parent().attr('id');
    if (! id) {
      return warn("Can't find id attribute of tab");
    }

    var $handle = $('*[href="#'+id+'"]');
    if (! $handle.length) {
      return warn("Can't find review tab "+id);
    }
    $handle.click();
  };

  var doScroll = function() {
    var $elem = $("#idTabRevws");
    if (! $elem.length) {
      $elem = $(".revws-review-list");
    }
    if ($elem.length) {
      var top = $elem.offset().top;
      $('html, body').animate({ scrollTop: top - 80 }, 500);
    }
  }

  var scrollToReviews = function() {
    if (displayedInTab()) {
      openTab();
      setTimeout(doScroll, 150);
    } else {
      doScroll();
    }
  }

  var s = window.location.search || '';
  if (s.indexOf('show=reviews') > -1) {
    scrollToReviews();
  }
  $('a[href="#idTabRevws"]').click(function(e) {
    e.preventDefault();
    scrollToReviews();
  });
  $('[data-revws-create-trigger]').click(function(e) {
    e.preventDefault();
    var entityId = parseInt($(this).data('revws-create-trigger'), 10);
    var entityType = $(this).data('revws-entity-type') || 'product'
    window.revws({
      type: 'TRIGGER_CREATE_REVIEW',
      entityType: entityType,
      entityId: entityId
    })
  });
})();
