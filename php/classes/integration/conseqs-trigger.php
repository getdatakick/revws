<?php
/**
* Copyright (C) 2017-2019 Petr Hucik <petr@getdatakick.com>
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
* @copyright 2017-2019 Petr Hucik
* @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*/

namespace Revws;

use Conseqs\Parameters\NumberParameterDefinition;
use Conseqs\Parameters\SelectParameterDefinition;
use Conseqs\Trigger;
use Conseqs\ParameterDefinitions;
use Conseqs\ParameterValues;
use Conseqs\RulesManager;
use Conseqs\ObjectModelMetadata;
use \Product;

class ConseqsTrigger extends Trigger
{
  private $name;
  private $description;
  private $hook;

  public function __construct($name, $description, $hook)
  {
    $this->name = $name;
    $this->description = $description;
    $this->hook = $hook;
  }

  /**
  * @return string
  */
  public function getName()
  {
    return $this->name;
  }

  /**
  * @return string
  */
  public function getDescription()
  {
    return $this->description;
  }

  /**
  * @param ParameterValues $settings
  * @param ParameterDefinitions $definitions
  * @throws \PrestaShopException
  */
  public function registerOutputParameterDefinitions(ParameterValues $settings, ParameterDefinitions $definitions)
  {
    $definitions->addParameter('actor', new SelectParameterDefinition($this->l('Actor'), [
      'employee' => $this->l('Employee'),
      'visitor' => $this->l('Visitor'),
    ]));
    $definitions->addParameter('review.ratings', new NumberParameterDefinition($this->l('Review: Ratings')));
    ObjectModelMetadata::addObjectParameterDefinitions('review', $this->l('Review'), 'RevwsReview', $definitions);
    ObjectModelMetadata::addObjectParameterDefinitions('review.product', $this->l('Review: Product'), 'Product', $definitions);
  }

  /**
  * @param ParameterValues $values
  * @param ParameterValues $settings
  * @param $sourceParameters
  * @throws \PrestaShopException
  */
  public function collectOutputParameterValues(ParameterValues $values, ParameterValues $settings, $sourceParameters)
  {
    $parameters = $sourceParameters['parameters'];
    $review = $parameters['review'];
    $actor = $parameters['actor'];
    $average = round(\Revws\Utils::calculateAverage($review->grades), 1);
    $values->addParameter('actor', $actor);
    $values->addParameter('review.ratings', $average);
    ObjectModelMetadata::addObjectParameterValues('review', $values, $review);
    $product = new Product($review->entity_type == 'product' ? $review->id_entity : null);
    ObjectModelMetadata::addObjectParameterValues('review.product', $values, $product);
  }

  /**
  * @param int $id
  * @param ParameterValues $settings
  * @param RulesManager $manager
  * @throws \PrestaShopException
  */
  public function register($id, ParameterValues $settings, RulesManager $manager)
  {
    $manager->registerHook($this->hook);
  }


}
