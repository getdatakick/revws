<?php
/**
 * Copyright (C) 2017-2023 Petr Hucik <petr@getdatakick.com>
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
 * @copyright 2017-2023 Petr Hucik
 * @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 */

use Revws\Actor;
use Revws\Notifications;
use Revws\Permissions;
use Revws\ReviewQuery;
use Revws\Settings;
use Revws\Utils;
use Revws\Visitor;

class RevwsReview extends ObjectModel
{

    /**
     * @var array
     */
    public static $definition = [
        'table' => 'revws_review',
        'primary' => 'id_review',
        'fields' => [
            'entity_type' => ['type' => self::TYPE_STRING, 'validate' => 'isString', 'required' => true],
            'id_entity' => ['type' => self::TYPE_INT, 'validate' => 'isUnsignedId', 'required' => true],
            'id_customer' => ['type' => self::TYPE_INT],
            'id_guest' => ['type' => self::TYPE_INT],
            'id_lang' => ['type' => self::TYPE_INT],
            'email' => ['type' => self::TYPE_STRING],
            'display_name' => ['type' => self::TYPE_STRING, 'required' => true],
            'title' => ['type' => self::TYPE_STRING],
            'content' => ['type' => self::TYPE_STRING, 'size' => 65535],
            'reply' => ['type' => self::TYPE_STRING, 'size' => 65535],
            'validated' => ['type' => self::TYPE_BOOL, 'validate' => 'isBool'],
            'deleted' => ['type' => self::TYPE_BOOL, 'validate' => 'isBool'],
            'verified_buyer' => ['type' => self::TYPE_BOOL, 'validate' => 'isBool'],
            'date_add' => ['type' => self::TYPE_DATE],
            'date_upd' => ['type' => self::TYPE_DATE],
        ],
    ];

    /**
     * @var
     */
    public $id;
    /**
     * @var
     */
    public $entity_type;
    /**
     * @var
     */
    public $id_entity;
    /**
     * @var
     */
    public $id_customer;
    /**
     * @var
     */
    public $id_guest;
    /**
     * @var
     */
    public $id_lang;
    /**
     * @var
     */
    public $email;
    /**
     * @var
     */
    public $display_name;
    /**
     * @var
     */
    public $title;
    /**
     * @var
     */
    public $content;
    /**
     * @var int
     */
    public $validated = 0;
    /**
     * @var int
     */
    public $deleted = 0;
    /**
     * @var int
     */
    public $verified_buyer = 0;
    /**
     * @var
     */
    public $date_add;
    /**
     * @var
     */
    public $date_upd;
    /**
     * @var
     */
    public $reply;

    /**
     * @var array
     */
    public $grades = [];
    /**
     * @var
     */
    public $images;
    /**
     * @var
     */
    public $entity;
    /**
     * @var
     */
    public $customer;

    /**
     * @var int|mixed
     */
    private $deletedOrig;
    /**
     * @var int|mixed
     */
    private $validatedOrig;
    /**
     * @var
     */
    private $replyOrig;

    /**
     * @param int $id
     * @param int $idLang
     * @param int $idShop
     *
     * @throws PrestaShopException
     */
    public function __construct($id = null, $idLang = null, $idShop = null)
    {
        parent::__construct($id, $idLang, $idShop);
        $this->deletedOrig = $this->deleted;
        $this->validatedOrig = $this->validated;
        $this->replyOrig = $this->reply;
    }

    /**
     * @param int $productId
     * @param Settings $settings
     * @param Visitor $visitor
     * @param int $pageSize
     * @param int $page
     * @param string $order
     * @param string $orderDir
     *
     * @return array
     * @throws PrestaShopException
     */
    public static function getByProduct($productId, Settings $settings, Visitor $visitor, $pageSize, $page, $order, $orderDir)
    {
        return self::findReviews($settings, [
            'product' => $productId,
            'deleted' => false,
            'visitor' => $visitor,
            'validated' => true,
            'pageSize' => $pageSize,
            'page' => $page,
            'order' => [
                'field' => $order,
                'direction' => $orderDir
            ]
        ]);
    }

    /**
     * @param Settings $settings
     * @param array $options
     *
     * @return array
     * @throws PrestaShopException
     */
    public static function findReviews(Settings $settings, $options)
    {
        $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
        $query = new ReviewQuery($settings, $options);

        // load reviews
        $reviews = [];
        $res = $conn->executeS($query->getSql());
        if ($res) {
            foreach ($res as $item) {
                $id = (int)$item['id_review'];
                $reviews[$id] = self::mapDbData($item);
            }
        }
        $count = (int)$conn->getRow($query->getCountSql())['cnt'];

        if ($reviews) {
            $keys = implode(', ', array_keys($reviews));

            // load ratings
            $grade = _DB_PREFIX_ . 'revws_review_grade';
            $sql = "SELECT id_review, id_criterion, grade FROM $grade WHERE id_review IN ($keys) ORDER by id_review, id_criterion";
            foreach ($conn->executeS($sql) as $row) {
                $id = (int)$row['id_review'];
                $key = (int)$row['id_criterion'];
                $value = (int)$row['grade'];
                $reviews[$id]->grades[$key] = $value;
            }

            // load images
            if ($settings->allowImages()) {
                $reviews[$id]->images = [];
                $image = _DB_PREFIX_ . 'revws_review_image';
                $sql = "SELECT id_review, image FROM $image WHERE id_review IN ($keys) ORDER by id_review, pos";
                foreach ($conn->executeS($sql) as $row) {
                    $id = (int)$row['id_review'];
                    $image = $row['image'];
                    $reviews[$id]->images[] = $image;
                }
            }
        }

        $page = $query->getPage();
        $pageSize = $query->getPageSize();
        return [
            'total' => (int)$count,
            'page' => $page,
            'pages' => $pageSize > 0 ? ceil($count / $pageSize) : 1,
            'pageSize' => $pageSize,
            'order' => $query->getOrderField(),
            'orderDir' => $query->getOrderDirection(),
            'reviews' => $reviews
        ];
    }

    /**
     * @param array $dbData
     *
     * @return RevwsReview
     */
    private static function mapDbData($dbData)
    {
        $review = new RevwsReview();
        $review->id = (int)$dbData['id_review'];
        $review->id_guest = (int)$dbData['id_guest'];
        $review->id_customer = (int)$dbData['id_customer'];
        $review->id_lang = (int)$dbData['id_lang'];
        $review->display_name = $dbData['display_name'];
        $review->entity_type = $dbData['entity_type'];
        $review->id_entity = (int)$dbData['id_entity'];
        $review->email = $dbData['email'];
        $review->title = empty($dbData['title']) ? '' : $dbData['title'];
        $review->content = $dbData['content'];
        $review->date_add = $dbData['date_add'];
        $review->date_upd = $dbData['date_add'];
        $review->validated = !!$dbData['validated'];
        $review->deleted = !!$dbData['deleted'];
        $review->verified_buyer = !!$dbData['verified_buyer'];
        $review->reply = $dbData['reply'];
        if (isset($dbData['entity'])) {
            $review->entity = $dbData['entity'];
        }
        if (isset($dbData['customer'])) {
            $review->customer = $dbData['customer'];
        }
        $review->grades = [];
        return $review;
    }

    /**
     * @param int $customerId
     * @param Settings $settings
     * @param int $pageSize
     * @param int $page
     * @param string $order
     * @param string $orderDir
     *
     * @return array
     * @throws PrestaShopException
     */
    public static function getByCustomer($customerId, Settings $settings, $pageSize, $page, $order, $orderDir)
    {
        return self::findReviews($settings, [
            'customer' => $customerId,
            'deleted' => false,
            'validated' => true,
            'pageSize' => $pageSize,
            'page' => $page,
            'order' => [
                'field' => $order,
                'direction' => $orderDir
            ]
        ]);
    }

    /**
     * @param Settings $settings
     * @param int $productId
     *
     * @return int[]
     * @throws PrestaShopException
     */
    public static function getAverageGrade(Settings $settings, $productId)
    {
        $query = new ReviewQuery($settings, [
            'product' => (int)$productId,
            'validated' => true,
            'deleted' => false
        ]);
        $row = Db::getInstance(_PS_USE_SQL_SLAVE_)->getRow($query->getAverageGradeSql());
        if ($row) {
            return [$row['grade'], $row['cnt']];
        }
        return [0, 0];
    }

    /**
     * @param RevwsReview[] $reviews
     * @param Permissions $perm
     *
     * @return array
     */
    public static function mapReviews($reviews, Permissions $perm)
    {
        $ret = [];
        foreach ($reviews as $review) {
            $ret[] = $review->toJSData($perm);
        }
        return $ret;
    }

    /**
     * @param Permissions $permissions
     *
     * @return array
     */
    public function toJSData(Permissions $permissions)
    {
        $canEdit = $permissions->canEdit($this);
        $images = is_array($this->images) ? $this->images : [];
        $ret = [
            'id' => (int)$this->id,
            'entityType' => $this->entity_type,
            'entityId' => (int)$this->id_entity,
            'authorType' => $this->getAuthorType(),
            'authorId' => $this->getAuthorId(),
            'displayName' => $this->display_name,
            'date' => $this->date_add,
            'email' => $canEdit ? $this->email : '',
            'grades' => $this->grades,
            'grade' => round(Utils::calculateAverage($this->grades)),
            'images' => $images,
            'title' => empty($this->title) ? '' : $this->title,
            'language' => (int)$this->id_lang,
            'content' => $this->content,
            'underReview' => !$this->validated,
            'reply' => $this->reply ? $this->reply : null,
            'deleted' => !!$this->deleted,
            'verifiedBuyer' => $this->isVerifiedBuyer(),
            'canReport' => $permissions->canReportAbuse($this),
            'canVote' => $permissions->canVote($this),
            'canEdit' => $canEdit,
            'canDelete' => $permissions->canDelete($this)
        ];
        if ($this->customer) {
            $ret['customer'] = $this->customer;
        }
        if ($this->entity) {
            $ret['entity'] = $this->entity;
        }
        return $ret;
    }

    /**
     * @return string
     */
    public function getAuthorType()
    {
        return $this->isCustomer() ? 'customer' : 'guest';
    }

    /**
     * @return bool
     */
    public function isCustomer()
    {
        return $this->id_customer > 0;
    }

    /**
     * @return int
     */
    public function getAuthorId()
    {
        return (int)($this->isCustomer() ? $this->id_customer : $this->id_guest);
    }

    /**
     * @return bool
     */
    public function isVerifiedBuyer()
    {
        return !!$this->verified_buyer;
    }

    /**
     * @param Visitor $visitor
     *
     * @return RevwsReview
     * @throws PrestaShopException
     */
    public static function fromRequest(Visitor $visitor)
    {
        $id = (int)Tools::getValue('id');
        if ($id === -1) {
            $id = null;
        }
        $review = new RevwsReview($id);
        $review->id_guest = $visitor->getGuestId();
        $review->id_customer = $visitor->getCustomerId();
        $review->entity_type = Tools::getValue('entityType');
        $review->id_entity = (int)Tools::getValue('entityId');
        $review->id_lang = $visitor->getLanguage();
        $review->display_name = Tools::getValue('displayName');
        $review->email = Tools::getValue('email');
        $review->title = Tools::getValue('title');
        $review->content = Tools::getValue('content');
        $review->date_upd = new \DateTime();
        $review->grades = [];
        $review->verified_buyer = $review->entity_type === 'product' && $visitor->hasPurchasedProduct($review->id_entity);
        $grades = Tools::getValue('grades');
        if (is_array($grades)) {
            foreach ($grades as $key => $value) {
                $review->grades[(int)$key] = (int)$value;
            }
        }
        $images = Tools::getValue('images');
        if (is_array($images)) {
            $review->images = [];
            $images = array_unique(array_values($images));
            foreach ($images as $image) {
                $review->images[] = $image;
            }
        }
        return $review;
    }

    /**
     * @return int
     */
    public function getLanguage()
    {
        return (int)$this->id_lang;
    }

    /**
     * @param array $json
     * @param Settings $settings
     *
     * @return RevwsReview
     * @throws PrestaShopException
     */
    public static function fromJson($json, Settings $settings)
    {
        $id = (int)$json['id'];
        if ($id === -1) {
            $id = null;
        }
        $review = new RevwsReview($id);
        $review->display_name = $json['displayName'];
        $review->title = $json['title'];
        $review->content = $json['content'];
        $review->date_upd = date('Y-m-d H:i:s');
        $review->date_add = $review->date_upd;
        $review->entity = isset($json['entity']) ? $json['entity'] : null;
        $review->customer = isset($json['customer']) ? $json['customer'] : null;
        $review->email = $json['email'];
        $review->reply = $json['reply'] ? str_replace('\\', '\\\\', $json['reply']) : null;
        $review->validated = !$json['underReview'];
        $review->deleted = $json['deleted'];
        $review->verified_buyer = !!$json['verifiedBuyer'];
        $review->id_lang = (int)$json['language'];
        $review->grades = [];
        foreach ($json['grades'] as $key => $value) {
            $review->grades[(int)$key] = (int)$value;
        }
        if (isset($json['date']) && $json['date']) {
            $date = \DateTime::createFromFormat("Y-m-d", $json['date']);
            if ($date) {
                $review->date_add = $date->format("Y-m-d H:i:s");
            }
        }
        if (!$id) {
            $review->entity_type = $json['entityType'];
            $review->id_entity = (int)$json['entityId'];
            $review->id_customer = (int)$json['authorId'];
            $review->validated = true;
        }
        return $review;
    }

    /**
     * @param Visitor $visitor
     *
     * @return bool
     */
    public function isOwner(Visitor $visitor)
    {
        if ($this->getAuthorType() != $visitor->getType()) {
            return false;
        }
        return $this->getAuthorId() == $visitor->getId();
    }

    /**
     * @param bool $autoDate
     * @param bool $nullValues
     *
     * @return bool|int|string
     * @throws PrestaShopException
     */
    public function add($autoDate = true, $nullValues = false)
    {
        $ret = parent::add($autoDate, $nullValues);
        if ($ret) {
            $id = (int)$this->id;
            $actor = Actor::getActor();
            $notif = Notifications::getInstance();
            $notif->reviewCreated($id, $actor);
            $this->validated ? $notif->reviewApproved($id, $actor) : $notif->needsApproval($id, $actor);
        }
        return $ret;
    }

    /**
     * @param bool $nullValues
     *
     * @return bool|int|string
     * @throws PrestaShopException
     */
    public function update($nullValues = false)
    {
        $ret = parent::update($nullValues);
        if ($ret) {
            $id = (int)$this->id;
            $actor = Actor::getActor();
            $notif = Notifications::getInstance();
            $deleted = !!$this->deleted;
            $delOrig = !!$this->deletedOrig;
            $validated = !!$this->validated;
            $valOrig = !!$this->validatedOrig;
            if ($deleted) {
                if (!$delOrig) {
                    $notif->reviewDeleted($id, $actor);
                } else {
                    $notif->reviewUpdated($id, $actor);
                }
            } else {
                $notif->reviewUpdated($id, $actor);
                if ($validated != $valOrig) {
                    $validated ? $notif->reviewApproved($id, $actor) : $notif->needsApproval($id, $actor);
                }
                if ($this->reply && !$this->replyOrig) {
                    $notif->replied($id, $actor);
                }
            }
        }
        return $ret;
    }

    /**
     * @return int
     * @throws PrestaShopException
     */
    public function delete()
    {
        $ret = parent::delete();
        $ret &= $this->deleteGrades();
        $ret &= $this->deleteImages();
        $ret &= $this->deleteReactions();
        return $ret;
    }

    /**
     * @return bool
     * @throws PrestaShopException
     */
    public function deleteGrades()
    {
        $conn = Db::getInstance();
        $id = (int)$this->id;
        return $conn->delete('revws_review_grade', "id_review = $id ");
    }

    /**
     * @return bool
     * @throws PrestaShopException
     */
    public function deleteImages()
    {
        $conn = Db::getInstance();
        $id = (int)$this->id;
        return $conn->delete('revws_review_image', "id_review = $id ");
    }

    /**
     * @return bool
     * @throws PrestaShopException
     */
    public function deleteReactions()
    {
        $conn = Db::getInstance();
        $id = (int)$this->id;
        return $conn->delete('revws_review_reaction', "id_review = $id ");
    }

    /**
     * @return false|int
     * @throws PrestaShopException
     */
    public function markDelete()
    {
        if ($this->id) {
            $this->deleted = true;
            $this->validated = false;
            return $this->save();
        }
        return false;
    }

    /**
     * @param bool $nullValues
     * @param bool $autoDate
     *
     * @return int
     * @throws PrestaShopException
     */
    public function save($nullValues = false, $autoDate = true)
    {
        $ret = parent::save($nullValues, $autoDate);
        $ret &= $this->saveGrades();
        $ret &= $this->saveImages();
        return $ret;
    }

    /**
     * @return true
     * @throws PrestaShopException
     */
    private function saveGrades()
    {
        if ($this->grades) {
            $conn = Db::getInstance();
            $id = (int)$this->id;
            if ($id) {
                $this->deleteGrades();
                foreach ($this->grades as $key => $value) {
                    $conn->insert('revws_review_grade',
                        [
                            'id_review' => $id,
                            'id_criterion' => (int)$key,
                            'grade' => (int)$value
                        ]
                    );
                }
            }
        }
        return true;
    }

    /**
     * @return true
     * @throws PrestaShopException
     */
    private function saveImages()
    {
        $conn = Db::getInstance();
        $id = (int)$this->id;
        if ($id && is_array($this->images)) {
            $this->deleteImages();
            $pos = 1;
            foreach ($this->images as $image) {
                $conn->insert('revws_review_image',
                    [
                        'id_review' => $id,
                        'image' => $image,
                        'pos' => $pos++
                    ]
                );
            }
        }
        return true;
    }

    /**
     * @param bool $up
     * @param Settings $settings
     * @param Visitor $visitor
     *
     * @return bool
     * @throws PrestaShopException
     */
    public function vote($up, Settings $settings, Visitor $visitor)
    {
        $conn = Db::getInstance();
        return $conn->insert('revws_review_reaction',
            [
                'id_review' => (int)$this->id,
                'id_customer' => (int)$visitor->getCustomerId(),
                'id_guest' => (int)$visitor->getGuestId(),
                'reaction_type' => $up ? 'vote_up' : 'vote_down'
            ]
        );
    }

    /**
     * @param string $reason
     * @param Settings $settings
     * @param Visitor $visitor
     *
     * @return bool
     * @throws PrestaShopException
     */
    public function reportAbuse($reason, Settings $settings, Visitor $visitor)
    {
        if ($settings->validateReportedReviews()) {
            $this->setValidated(false);
            $this->save();
        }
        $conn = Db::getInstance();
        return $conn->insert('revws_review_reaction',
            [
                'id_review' => (int)$this->id,
                'id_customer' => (int)$visitor->getCustomerId(),
                'id_guest' => (int)$visitor->getGuestId(),
                'reaction_type' => 'report_abuse'
            ]
        );
    }

    /**
     * @param bool $validated
     *
     * @return void
     */
    public function setValidated($validated)
    {
        $this->validated = $validated;
    }

    /**
     * @return void
     * @throws PrestaShopException
     */
    public function loadGrades()
    {
        $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
        $grade = _DB_PREFIX_ . 'revws_review_grade';
        $id = (int)$this->id;
        $this->grades = [];
        if ($id) {
            $query = "SELECT g.* FROM $grade g WHERE g.id_review = $id";
            $dbData = $conn->executeS($query);
            if ($dbData) {
                foreach ($dbData as $row) {
                    $key = (int)$row['id_criterion'];
                    $value = (int)$row['grade'];
                    $this->grades[$key] = $value;
                }
            }
        }
    }

    /**
     * @param Settings $settings
     *
     * @return void
     * @throws PrestaShopException
     */
    public function loadImages(Settings $settings)
    {
        if ($settings->allowImages()) {
            $this->images = [];
            $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
            $image = _DB_PREFIX_ . 'revws_review_image';
            $id = (int)$this->id;
            if ($id) {
                $query = "SELECT image FROM $image WHERE id_review = $id ORDER by pos";
                $dbData = $conn->executeS($query);
                if ($dbData) {
                    foreach ($dbData as $row) {
                        $this->images[] = $row['image'];
                    }
                }
            }
        }
    }

    /**
     * @param string $action
     * @param string $hash
     * @param Settings $settings
     *
     * @return bool
     * @throws PrestaShopException
     */
    public function verifySecretHash($action, $hash, $settings)
    {
        return $this->getSecretHash($action, $settings) === $hash;
    }

    /**
     * @param string $action
     * @param Settings $settings
     *
     * @return string
     * @throws PrestaShopException
     */
    public function getSecretHash($action, $settings)
    {
        return md5($this->getSignature($action, $settings));
    }

    /**
     * @param string $action
     * @param Settings $settings
     *
     * @return string
     * @throws PrestaShopException
     */
    private function getSignature($action, $settings)
    {
        $salt = $settings->getSalt();
        return (
            (int)$this->id .
            $action .
            $this->display_name .
            (int)$this->deleted .
            $this->title .
            $salt .
            Utils::calculateAverage($this->grades) .
            $this->content .
            (int)$this->validated
        );
    }
}
