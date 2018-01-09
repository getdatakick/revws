(function() {
  window.revws = {
    createReview: function(productId) {
      this.submit({
        action: 'TRIGGER_CREATE_REVIEW',
        productId: productId
      });
    },
    editReview: function(reviewId) {
      this.submit({
        action: 'TRIGGER_EDIT_REVIEW',
        reviewId: reviewId
      });
    },
    deleteReview: function(reviewId) {
      this.submit({
        action: 'TRIGGER_DELETE_REVIEW',
        reviewId: reviewId
      });
    },
    reportReview: function(reviewId) {
      this.submit({
        action: 'TRIGGER_REPORT_REVIEW',
        reviewId: reviewId
      });
    },
    vote: function(reviewId, direction) {
      this.submit({
        action: 'TRIGGER_VOTE',
        reviewId: reviewId,
        direction: direction
      });
    },

    queue: [],
    submit: function(action) {
      if (! window.revwsApp) {
        this.queue.push(action);
      } else {
        window.revwsApp(action);
      }
    }
  };
  var tag = document.createElement('script');
  tag.src = window.revwsData.appJsUrl;
  tag.setAttribute('defer', '');
  tag.setAttribute('async', '');
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  $(document).ready(function () {
    $('*[data-revws-create-trigger]').click(function(e) {
      e.preventDefault();
      revws.createReview($(this).data('revws-create-trigger'));
    });
    $('*[data-revws-delete-trigger]').click(function(e) {
      e.preventDefault();
      revws.deleteReview($(this).data('revws-delete-trigger'));
    });
    $('*[data-revws-edit-trigger]').click(function(e) {
      e.preventDefault();
      revws.editReview($(this).data('revws-edit-trigger'));
    });
    $('*[data-revws-report-trigger]').click(function(e) {
      e.preventDefault();
      revws.reportReview($(this).data('revws-report-trigger'));
    });
    $('*[data-revws-vote-trigger]').click(function(e) {
      e.preventDefault();
      revws.vote($(this).data('revws-vote-trigger'), $(this).data('revws-direction'));
    });
  });
})();
