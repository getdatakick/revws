<?php
/**
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
*/

namespace Revws;

class DatakickIntegration {

  public static function integrate($params) {
    if (isset($params['version'])) {
      $datakickVersion = $params['version'];
      if (version_compare($datakickVersion, '2.1.0' >= 0)) {
        return self::extendDatakick();
      }
    }
  }

  private static function extendDatakick() {
    return [
      'revwsCriteria' => self::criteria(),
      'revwsReviews' => self::reviews(),
      'revwsRatings' => self::reviewRatings(),
    ];
  }

  private static function criteria() {
    return [
      'id' => 'revwsCriteria',
      'singular' => 'revwsCriterion',
      'description' => 'Review Criteria',
      'parameters' => [ 'language' ],
      'key' => [ 'id' ],
      'display' => 'label',
      'category' => 'reviews',
      'create' => true,
      'delete' => true,
      'tables' => [
        'c' => [
          'table' => 'revws_criterion',
          'create' => [
            'global' => 1,
            'active' => 1
          ]
        ],
        'cl' => [
          'table' => 'revws_criterion_lang',
          'require' => [ 'c' ],
          'parameters' => [ 'language' ],
          'create' => [
            'id_criterion' => '<pk>',
            'id_lang' => '<param:language>',
          ],
          'join' => [
            'type' => 'INNER',
            'conditions' => [
              "cl.id_criterion = c.id_criterion",
              "<bind-param:language:cl.id_lang>"
            ]
          ]
        ]
      ],
      'fields' => [
        'id' => [
          'type' => 'number',
          'description' => 'ID',
          'mapping' => [
            'c' => 'id_criterion',
            'cl' => 'id_criterion'
          ],
          'update' => false,
          'selectRecord' => 'revwsCriteria'
        ],
        'label' => [
          'type' => 'string',
          'description' => 'label',
          'mapping' => [ 'cl' => 'label' ],
          'update' => true,
        ],
        'global' => [
          'type' => 'boolean',
          'description' => 'Applies to entire catalog',
          'mapping' => [ 'c' => 'global' ],
          'update' => true,
        ],
        'active' => [
          'type' => 'boolean',
          'description' => 'is enabled',
          'mapping' => [ 'c' => 'active' ],
          'update' => true,
        ],
        'entityType' => [
          'type' => 'string',
          'description' => 'entity type',
          'mapping' => [ 'c' => 'entity_type' ],
          'update' => true,
          'values' => [
            'product' => 'Product'
          ]
        ]
      ],
      'links' => [
        'products' => [
          'description' => "Associated products",
          'collection' => 'products',
          'type' => 'HABTM',
          'sourceFields' => array('id'),
          'targetFields' => array('id'),
          'joinTable' => 'revws_criterion_product',
          'joinFields' => array(
            'sourceFields' => array('id_criterion'),
            'targetFields' => array('id_product'),
          ),
          'delete' => true,
          'create' => true,
        ],
        'categories' => [
          'description' => "Associated categories",
          'collection' => 'categories',
          'type' => 'HABTM',
          'sourceFields' => array('id'),
          'targetFields' => array('id'),
          'joinTable' => 'revws_criterion_category',
          'joinFields' => array(
            'sourceFields' => array('id_criterion'),
            'targetFields' => array('id_category'),
          ),
          'delete' => true,
          'create' => true,
        ],
        'ratings' => [
          'description' => 'Ratings',
          'collection' => 'revwsRatings',
          'type' => 'HAS_MANY',
          'sourceFields' => [ 'id' ],
          'targetFields' => [ 'criterionId' ],
          'delete' => true,
          'create' => true,
        ]
      ]
    ];
  }

  private static function reviews() {
    return [
      'id' => 'revwsReviews',
      'singular' => 'revwsReview',
      'description' => 'Reviews',
      'key' => [ 'id' ],
      'parameters' => [ 'language' ],
      'display' => 'title',
      'category' => 'reviews',
      'create' => true,
      'delete' => true,
      'tables' => [
        'r' => [
          'table' => 'revws_review',
          'create' => [
            'id_lang' => '<param:language>',
            'validated' => 0,
            'deleted' => 0,
            'id_customer' => 0,
            'id_guest' => 0,
            'date_add' => '<param:timestamp>',
            'date_upd' => '<param:timestamp>'
          ]
        ],
        'pl' => [
          'table' => 'product_lang',
          'parameters' => [ 'language' ],
          'join' => [
            'type' => 'LEFT',
            'conditions' => [
              "r.entity_type = 'product'",
              "pl.id_product = r.id_entity",
              "<bind-param:language:pl.id_lang>"
            ]
          ]
        ]
      ],
      'fields' => [
        'id' => [
          'type' => 'number',
          'description' => 'ID',
          'mapping' => [
            'r' => 'id_review',
          ],
          'update' => false,
          'selectRecord' => 'revwsReviews'
        ],
        'product' => [
          'type' => 'string',
          'description' => 'product',
          'mapping' => [
            'pl' => 'name'
          ],
          'update' => false
        ],
        'entityType' => [
          'type' => 'string',
          'description' => 'entity type',
          'mapping' => [
            'r' => 'entity_type',
          ],
          'required' => true,
          'update' => true,
          'values' => [
            'product' => 'Product'
          ]
        ],
        'entityId' => [
          'type' => 'number',
          'description' => 'ID entity',
          'mapping' => [
            'r' => 'id_entity',
          ],
          'required' => true,
          'update' => true,
          'selectRecord' => 'products'
        ],
        'customerId' => [
          'type' => 'number',
          'description' => 'ID customer',
          'mapping' => [
            'r' => 'id_customer',
          ],
          'update' => true,
          'selectRecord' => 'customers'
        ],
        'visitorId' => [
          'type' => 'number',
          'description' => 'ID visitor',
          'mapping' => [
            'r' => 'id_guest',
          ],
          'update' => true,
          'selectRecord' => 'visitors'
        ],
        'languageId' => [
          'type' => 'number',
          'description' => 'ID language',
          'mapping' => [
            'r' => 'id_lang',
          ],
          'update' => true,
          'selectRecord' => 'languages'
        ],
        'title' => [
          'type' => 'string',
          'description' => 'title',
          'mapping' => [ 'r' => 'title' ],
          'update' => true,
          'required' => true
        ],
        'content' => [
          'type' => 'string',
          'description' => 'content',
          'mapping' => [ 'r' => 'content' ],
          'update' => true,
        ],
        'reply' => [
          'type' => 'string',
          'description' => 'shop reply',
          'mapping' => [ 'r' => 'reply' ],
          'update' => true,
        ],
        'email' => [
          'type' => 'string',
          'description' => 'email',
          'mapping' => [ 'r' => 'email' ],
          'update' => true,
          'required' => true
        ],
        'reviewerName' => [
          'type' => 'string',
          'description' => 'Reviewer name',
          'mapping' => [ 'r' => 'display_name' ],
          'update' => true,
          'required' => true,
        ],
        'approved' => [
          'type' => 'boolean',
          'description' => 'approved',
          'mapping' => [ 'r' => 'validated' ],
          'update' => true,
        ],
        'verified' => [
          'type' => 'boolean',
          'description' => 'verified buyer',
          'mapping' => [ 'r' => 'verified_buyer' ],
          'update' => true,
        ],
        'deleted' => [
          'type' => 'boolean',
          'description' => 'deleted',
          'mapping' => [ 'r' => 'deleted' ],
          'update' => true,
        ],
        'created' => [
          'type' => 'datetime',
          'description' => 'date created',
          'mapping' => [ 'r' => 'date_add' ],
          'update' => true,
        ],
        'updated' => [
          'type' => 'datetime',
          'description' => 'date updated',
          'mapping' => [ 'r' => 'date_upd' ],
          'update' => true,
        ],
        'avgRatings' => [
          'type' => 'number',
          'description' => 'ratings',
          'sql' => "(SELECT ROUND(SUM(g.grade) / COUNT(1), 2) FROM "._DB_PREFIX_."revws_review_grade g WHERE g.id_review = r.id_review)",
          'require' => ['r'],
          'update' => false,
        ],
        'ratings' => [
          'type' => 'array[string]',
          'description' => 'ratings (x,y,z...)',
          'sql' => '(
            SELECT
            REPLACE(GROUP_CONCAT(CONCAT(c.label, ":", ROUND(g.grade, 0)) ORDER BY c.id_criterion SEPARATOR "@SEP@"), "@SEP@", CHAR(1))
            FROM '._DB_PREFIX_.'revws_review_grade g
            LEFT JOIN '._DB_PREFIX_.'revws_criterion_lang c on (c.id_criterion = g.id_criterion and <bind-param:language:c.id_lang>)
            WHERE g.id_review = r.id_review
            )',
            'require' => ['r'],
            'update' => false,
          ],
        ],
        'expressions' => [
        ],
        'links' => [
          'product' => [
            'description' => 'Product',
            'collection' => 'products',
            'type' => 'BELONGS_TO',
            'sourceFields' => [ 'entityId' ],
            'targetFields' => [ 'id' ],
            'conditions' => [
              "<source:entityType> = 'product'"
            ],
            'generateReverse' => [
              'id' => 'revwsReview',
              'description' => 'Reviews',
              'type' => 'HAS_MANY'
            ]
          ],
          'customer' => [
            'description' => 'Customer',
            'collection' => 'customers',
            'type' => 'HAS_ONE',
            'sourceFields' => [ 'customerId' ],
            'targetFields' => [ 'id' ],
            'generateReverse' => [
              'id' => 'revwsReview',
              'description' => 'Reviews',
              'type' => 'HAS_MANY'
            ]
          ],
          'visitor' => [
            'description' => 'Visitor',
            'collection' => 'visitors',
            'type' => 'HAS_ONE',
            'sourceFields' => [ 'visitorId' ],
            'targetFields' => [ 'id' ],
            'generateReverse' => [
              'id' => 'revwsReview',
              'description' => 'Reviews',
              'type' => 'HAS_MANY'
            ]
          ],
          'language' => [
            'description' => 'Language',
            'collection' => 'languages',
            'type' => 'BELONGS_TO',
            'sourceFields' => [ 'languageId' ],
            'targetFields' => [ 'id' ],
            'generateReverse' => [
              'id' => 'revwsReview',
              'description' => 'Reviews',
              'type' => 'HAS_MANY'
            ]
          ],
          'ratings' => [
            'description' => 'Ratings',
            'collection' => 'revwsRatings',
            'type' => 'HAS_MANY',
            'sourceFields' => [ 'id' ],
            'targetFields' => [ 'reviewId' ],
            'create' => true,
            'delete' => true
          ],
        ],
        'list' => [
          'columns' => [ 'id', 'product', 'title', 'avgRatings', 'email' ],
          'sorts' => [ 'id' ]
        ]
      ];
    }

    private static function reviewRatings() {
      return [
        'id' => 'revwsRatings',
        'singular' => 'revwsRating',
        'description' => 'Review Ratings',
        'key' => [ 'reviewId', 'criterionId' ],
        'parameters' => [ 'language'],
        'display' => 'rating',
        'category' => 'reviews',
        'create' => true,
        'delete' => true,
        'tables' => [
          'g' => [
            'table' => 'revws_review_grade',
            'create' => [
            ]
          ],
          'cl' => [
            'table' => 'revws_criterion_lang',
            'require' => [ 'g' ],
            'parameters' => [ 'language' ],
            'join' => [
              'type' => 'INNER',
              'conditions' => [
                "cl.id_criterion = g.id_criterion",
                "<bind-param:language:cl.id_lang>"
              ]
            ]
          ],
        ],
        'fields' => [
          'reviewId' => [
            'type' => 'number',
            'description' => 'ID review',
            'mapping' => [
              'g' => 'id_review',
            ],
            'update' => true,
            'required' => true,
            'selectRecord' => 'revwsReviews'
          ],
          'criterion' => [
            'type' => 'string',
            'description' => 'criterion',
            'mapping' => [
              'cl' => 'label'
            ],
            'update' => false
          ],
          'criterionId' => [
            'type' => 'number',
            'description' => 'ID criterion',
            'mapping' => [
              'g' => 'id_criterion'
            ],
            'required' => true,
            'update' => true
          ],
          'rating' => [
            'type' => 'number',
            'description' => 'rating',
            'mapping' => [
              'g' => 'grade',
            ],
            'required' => true,
            'update' => true,
          ],
        ],
        'links' => [
          'review' => [
            'description' => 'Review',
            'collection' => 'revwsReviews',
            'type' => 'BELONGS_TO',
            'sourceFields' => [ 'reviewId' ],
            'targetFields' => [ 'id' ],
          ],
          'criterion' => [
            'description' => 'Criterion',
            'collection' => 'revwsCriteria',
            'type' => 'BELONGS_TO',
            'sourceFields' => [ 'criterionId' ],
            'targetFields' => [ 'id' ],
          ],
        ]
      ];
    }

  }
