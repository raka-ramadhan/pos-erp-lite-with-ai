-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: erp_lite
-- ------------------------------------------------------
-- Server version	8.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `menu_permissions`
--

DROP TABLE IF EXISTS `menu_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_permissions` (
  `permission_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `menu_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`permission_id`,`menu_id`),
  KEY `IDX_3207bc82716bcbfde11b7bd78e` (`permission_id`),
  KEY `IDX_1f17df0a84fd844e35f0d43a93` (`menu_id`),
  CONSTRAINT `FK_1f17df0a84fd844e35f0d43a931` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`),
  CONSTRAINT `FK_3207bc82716bcbfde11b7bd78ef` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_permissions`
--

LOCK TABLES `menu_permissions` WRITE;
/*!40000 ALTER TABLE `menu_permissions` DISABLE KEYS */;
INSERT INTO `menu_permissions` VALUES ('1c6119cd-407b-49dc-a124-78d2c92968e8','b5db41ff-e8c5-4f3a-907c-8ff0440d24ec'),('20a7d548-6d0f-4b09-a7a8-d39d31aad047','bab648c5-6214-44f1-b97f-c86b143b88b6'),('427717fa-dec3-4e7b-b74b-1800604c68f1','fb3bef9c-2f59-491a-90b8-b2208647f266'),('4bf8f435-85fa-45c2-81a8-9dfe15c1bab5','c47b6be4-938a-4ccb-99a9-cb5ad6fd1476'),('68b2bdf9-0cfc-4780-8881-a9d4f3bd541a','015c6495-5370-4899-8096-60a414aa4168'),('6da04dec-1059-4331-9c0e-66be06fcd56f','46fdb5f3-43e9-4d77-ac37-2857e9b82722'),('719fa9f7-0f93-468c-96cc-dbfd492fd1a4','f6107a8c-d511-4044-af56-d1cb3c1c0ca6'),('946599ba-3e7b-4ef1-be3c-6267a5dd26ec','5dcb610b-9f03-42db-bae8-ef4b5a681340'),('a3060ed7-f889-4432-8199-4c99484c5276','fae3d1da-e8df-4686-81a5-395051ad2d2d'),('f86630f2-53d2-4cae-880d-65aebe07d61b','bd25a39f-a445-4e28-bbc5-c0576a7b30b8');
/*!40000 ALTER TABLE `menu_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menus` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('GROUP','MENU','SUBMENU','LINK') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MENU',
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `isHidden` tinyint NOT NULL DEFAULT '0',
  `parentId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `parent_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_00ccc1ed4e9fc23bc1246269359` (`parent_id`),
  CONSTRAINT `FK_00ccc1ed4e9fc23bc1246269359` FOREIGN KEY (`parent_id`) REFERENCES `menus` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES ('015c6495-5370-4899-8096-60a414aa4168','Menus','menus','','MENU','Menu','/dashboard/menus',13,1,0,'352fe8be-3459-4a00-8d94-d8dbeaef7c2f','2026-07-31 14:23:53.148953','2026-07-31 14:23:53.148953',NULL),('352fe8be-3459-4a00-8d94-d8dbeaef7c2f','RBAC','rbac','Role Based Access Control','GROUP','Shield','',2,1,0,NULL,'2026-07-31 14:23:53.119849','2026-07-31 14:23:53.119849',NULL),('7f3ec3ad-c0e1-4817-93e8-80bacab160be','Dashboard','dashboard','Dashboard overview','GROUP','LayoutDashboard','',1,1,0,NULL,'2026-07-31 14:23:53.106496','2026-07-31 14:23:53.106496',NULL),('c47b6be4-938a-4ccb-99a9-cb5ad6fd1476','Roles','roles','','MENU','Shield','/dashboard/roles',11,1,0,'352fe8be-3459-4a00-8d94-d8dbeaef7c2f','2026-07-31 14:23:53.132338','2026-07-31 14:23:53.132338',NULL),('f6107a8c-d511-4044-af56-d1cb3c1c0ca6','Permissions','permissions','','MENU','Key','/dashboard/permissions',12,1,0,'352fe8be-3459-4a00-8d94-d8dbeaef7c2f','2026-07-31 14:23:53.139264','2026-07-31 14:23:53.139264',NULL),('fae3d1da-e8df-4686-81a5-395051ad2d2d','Users','users','','MENU','Users','/dashboard/users',10,1,0,'352fe8be-3459-4a00-8d94-d8dbeaef7c2f','2026-07-31 14:23:53.125995','2026-07-31 14:23:53.125995',NULL),('fb3bef9c-2f59-491a-90b8-b2208647f266','Overview','dashboard_overview','','MENU','LayoutDashboard','/dashboard',1,1,0,'7f3ec3ad-c0e1-4817-93e8-80bacab160be','2026-07-31 14:23:53.113191','2026-07-31 14:23:53.113191',NULL);
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `group` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dashboard',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `sortOrder` int NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES ('08dd148c-2606-4865-b1d4-a94ccc5a95f5','Delete Menus','delete_menus','Delete menu','Menus',1,34,'2026-07-31 14:23:52.996521','2026-07-31 14:23:52.996521'),('09aa99e9-9e4b-4c29-8444-8aa9045d48c1','Delete Roles','delete_roles','Delete role','Roles',1,23,'2026-07-31 13:55:12.615936','2026-07-31 13:55:12.615936'),('0d835356-db06-46fb-84e0-be5407104c61','Update Roles','role.update','Update existing role','Roles',1,22,'2026-07-31 14:46:17.529094','2026-07-31 14:46:17.529094'),('1c6119cd-407b-49dc-a124-78d2c92968e8','View Users','view_users','View user list','Users',1,10,'2026-07-31 13:55:12.575008','2026-07-31 13:55:12.575008'),('20a7d548-6d0f-4b09-a7a8-d39d31aad047','View Dashboard','view_dashboard','Access to dashboard','Dashboard',1,1,'2026-07-31 13:55:12.564101','2026-07-31 13:55:12.564101'),('2d99b93f-14fa-4689-a670-109202a6df32','Update Menus','update_menus','Update existing menu','Menus',1,33,'2026-07-31 14:23:52.989843','2026-07-31 14:23:52.989843'),('35f13ef4-a070-4326-9bff-b1a9d5183c92','Change User Status','user.change_status','Change user active status','Users',1,14,'2026-07-31 14:46:17.497807','2026-07-31 14:46:17.497807'),('36f32a69-b0c9-40ab-aa93-3e07ecfbbe58','Update Users','update_users','Update existing user','Users',1,12,'2026-07-31 13:55:12.588174','2026-07-31 13:55:12.588174'),('39ae2eaa-7335-43ab-9267-efcbac420116','Create Categories','create_categories','Create new category','Categories',1,51,'2026-07-31 13:55:12.656748','2026-07-31 13:55:12.656748'),('427717fa-dec3-4e7b-b74b-1800604c68f1','View Dashboard','dashboard.view','Access to dashboard','Dashboard',1,1,'2026-07-31 14:46:17.434865','2026-07-31 14:46:17.434865'),('47266a82-e410-4213-8d4d-739f89550ea3','Create Roles','role.create','Create new role','Roles',1,21,'2026-07-31 14:46:17.518181','2026-07-31 14:46:17.518181'),('4bf8f435-85fa-45c2-81a8-9dfe15c1bab5','View Roles','role.view','View role list','Roles',1,20,'2026-07-31 14:46:17.508020','2026-07-31 14:46:17.508020'),('4c5dc3bd-5e2f-4972-a88a-202dfa2b2486','Update Roles','update_roles','Update existing role','Roles',1,22,'2026-07-31 13:55:12.610248','2026-07-31 13:55:12.610248'),('68b2bdf9-0cfc-4780-8881-a9d4f3bd541a','View Menus','menu.view','View menu list','Menus',1,40,'2026-07-31 14:46:17.556348','2026-07-31 16:46:43.000000'),('6da04dec-1059-4331-9c0e-66be06fcd56f','View Categories','view_categories','View category list','Categories',1,50,'2026-07-31 13:55:12.650986','2026-07-31 13:55:12.650986'),('6fe9ed3b-0df5-4968-ada2-91fd090e1a53','Delete Permissions','permission.delete','Delete permission','Permissions',1,33,'2026-07-31 16:46:43.787161','2026-07-31 16:46:43.787161'),('719fa9f7-0f93-468c-96cc-dbfd492fd1a4','View Permissions','permission.view','View permission list','Permissions',1,30,'2026-07-31 14:46:17.549074','2026-07-31 14:46:17.549074'),('7715d7e6-fadf-4d46-8751-ca1da14f4a30','Delete Roles','role.delete','Delete role','Roles',1,23,'2026-07-31 14:46:17.539189','2026-07-31 14:46:17.539189'),('7b82145d-82ac-4e5d-9d14-85991ca78719','Create Users','user.create','Create new user','Users',1,11,'2026-07-31 14:46:17.462534','2026-07-31 14:46:17.462534'),('84a247a9-ddd3-45c5-afec-a4a43308a6f4','Update Categories','update_categories','Update existing category','Categories',1,52,'2026-07-31 13:55:12.661810','2026-07-31 13:55:12.661810'),('879ea85e-0429-47f1-b446-039dbfcd2e5b','Create Roles','create_roles','Create new role','Roles',1,21,'2026-07-31 13:55:12.604364','2026-07-31 13:55:12.604364'),('88204cb0-e08a-453f-b95a-c199212d5b8b','Create Menus','menu.create','Create new menu','Menus',1,41,'2026-07-31 14:46:17.566515','2026-07-31 16:46:43.000000'),('91480d06-1d32-4432-89a6-79aca8fed4d5','Update Menus','menu.update','Update existing menu','Menus',1,42,'2026-07-31 14:46:17.575880','2026-07-31 16:46:43.000000'),('93f54d6d-31be-4660-8211-018f34c16352','Create Users','create_users','Create new user','Users',1,11,'2026-07-31 13:55:12.581788','2026-07-31 13:55:12.581788'),('946599ba-3e7b-4ef1-be3c-6267a5dd26ec','View Roles','view_roles','View role list','Roles',1,20,'2026-07-31 13:55:12.598154','2026-07-31 13:55:12.598154'),('a3060ed7-f889-4432-8199-4c99484c5276','View Users','user.view','View user list','Users',1,10,'2026-07-31 14:46:17.453148','2026-07-31 14:46:17.453148'),('a7bc659f-bf66-48bd-9ff3-b7ba14a3bc56','Create Menus','create_menus','Create new menu','Menus',1,32,'2026-07-31 14:23:52.982345','2026-07-31 14:23:52.982345'),('b1531e1d-1ace-4985-8f64-63c012673fc8','Update Users','user.update','Update existing user','Users',1,12,'2026-07-31 14:46:17.473598','2026-07-31 14:46:17.473598'),('b5d20f3b-b85b-4856-8c56-a03b858ec3c6','View Menus','view_menus','View menu list','Menus',1,31,'2026-07-31 14:23:52.955366','2026-07-31 14:23:52.955366'),('b8e50909-98c3-40ee-aa7d-9a0ca8b90a56','Create Permissions','permission.create','Create new permission','Permissions',1,31,'2026-07-31 16:46:43.774693','2026-07-31 16:46:43.774693'),('bb84dd04-1100-4334-9f5a-6005043b3805','Delete Menus','menu.delete','Delete menu','Menus',1,43,'2026-07-31 14:46:17.584368','2026-07-31 16:46:43.000000'),('bde2a703-a8ec-45bd-9836-0011ea5c26f5','Delete Categories','delete_categories','Delete category','Categories',1,53,'2026-07-31 13:55:12.669889','2026-07-31 13:55:12.669889'),('ccf336f7-f520-46d1-9298-b7e58f2d85cf','Delete Users','delete_users','Delete user','Users',1,13,'2026-07-31 13:55:12.593368','2026-07-31 13:55:12.593368'),('e16f4fc2-158b-453d-aeff-be0dd2ef91db','Delete Users','user.delete','Delete user','Users',1,13,'2026-07-31 14:46:17.485111','2026-07-31 14:46:17.485111'),('f3060e41-0326-4acd-818f-d7429f2abba2','Update Permissions','permission.update','Update existing permission','Permissions',1,32,'2026-07-31 16:46:43.782848','2026-07-31 16:46:43.782848'),('f86630f2-53d2-4cae-880d-65aebe07d61b','View Permissions','view_permissions','View permission list','Permissions',1,30,'2026-07-31 13:55:12.621299','2026-07-31 13:55:12.621299');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `role_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `IDX_178199805b901ccd220ab7740e` (`role_id`),
  KEY `IDX_17022daf3f885f7d35423e9971` (`permission_id`),
  CONSTRAINT `FK_17022daf3f885f7d35423e9971e` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`),
  CONSTRAINT `FK_178199805b901ccd220ab7740ec` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES ('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','0d835356-db06-46fb-84e0-be5407104c61'),('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','35f13ef4-a070-4326-9bff-b1a9d5183c92'),('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','427717fa-dec3-4e7b-b74b-1800604c68f1'),('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','47266a82-e410-4213-8d4d-739f89550ea3'),('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','4bf8f435-85fa-45c2-81a8-9dfe15c1bab5'),('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','68b2bdf9-0cfc-4780-8881-a9d4f3bd541a'),('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','6fe9ed3b-0df5-4968-ada2-91fd090e1a53'),('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','719fa9f7-0f93-468c-96cc-dbfd492fd1a4'),('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','7715d7e6-fadf-4d46-8751-ca1da14f4a30'),('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','7b82145d-82ac-4e5d-9d14-85991ca78719'),('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','88204cb0-e08a-453f-b95a-c199212d5b8b'),('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','91480d06-1d32-4432-89a6-79aca8fed4d5'),('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','a3060ed7-f889-4432-8199-4c99484c5276'),('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','b1531e1d-1ace-4985-8f64-63c012673fc8'),('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','b8e50909-98c3-40ee-aa7d-9a0ca8b90a56'),('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','bb84dd04-1100-4334-9f5a-6005043b3805'),('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','e16f4fc2-158b-453d-aeff-be0dd2ef91db'),('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','f3060e41-0326-4acd-818f-d7429f2abba2'),('3981f758-a7c4-4537-83e9-5afea5df0a2d','35f13ef4-a070-4326-9bff-b1a9d5183c92'),('3981f758-a7c4-4537-83e9-5afea5df0a2d','427717fa-dec3-4e7b-b74b-1800604c68f1'),('3981f758-a7c4-4537-83e9-5afea5df0a2d','4bf8f435-85fa-45c2-81a8-9dfe15c1bab5'),('3981f758-a7c4-4537-83e9-5afea5df0a2d','68b2bdf9-0cfc-4780-8881-a9d4f3bd541a'),('3981f758-a7c4-4537-83e9-5afea5df0a2d','719fa9f7-0f93-468c-96cc-dbfd492fd1a4'),('3981f758-a7c4-4537-83e9-5afea5df0a2d','7b82145d-82ac-4e5d-9d14-85991ca78719'),('3981f758-a7c4-4537-83e9-5afea5df0a2d','a3060ed7-f889-4432-8199-4c99484c5276'),('3981f758-a7c4-4537-83e9-5afea5df0a2d','b1531e1d-1ace-4985-8f64-63c012673fc8'),('77845828-3652-4993-853b-c2fd28532f00','427717fa-dec3-4e7b-b74b-1800604c68f1'),('77845828-3652-4993-853b-c2fd28532f00','a3060ed7-f889-4432-8199-4c99484c5276'),('b6f5e15f-91fb-44ef-b541-3eff7fd2e108','427717fa-dec3-4e7b-b74b-1800604c68f1');
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  `sortOrder` int NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_f6d54f95c31b73fb1bdd8e91d0` (`code`),
  UNIQUE KEY `IDX_648e3f5447f725579d7d4ffdfb` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES ('0ee0930a-4b65-4402-abd8-ad9be6d7e55a','Administrator','Full system access with all permissions',1,1,'2026-07-31 13:55:12.712832','2026-07-31 15:51:18.858843','administrator'),('3981f758-a7c4-4537-83e9-5afea5df0a2d','Manager','Can manage users and view roles',1,2,'2026-07-31 13:55:12.728630','2026-07-31 16:29:19.000000','manager'),('77845828-3652-4993-853b-c2fd28532f00','Staff','Basic staff access',1,3,'2026-07-31 13:55:12.742290','2026-07-31 16:29:21.000000','staff'),('b6f5e15f-91fb-44ef-b541-3eff7fd2e108','User','Basic user access',1,4,'2026-07-31 13:55:12.749116','2026-07-31 15:51:18.869094','user');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `role_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`),
  KEY `FK_a2cecd1a3531c0b041e29ba46e1` (`role_id`),
  CONSTRAINT `FK_a2cecd1a3531c0b041e29ba46e1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('586b32b7-9fdd-484c-b448-f6bfa4f6682b','Raka Hikmah Edit','raka@example.com','$2b$10$TjZFy/Btb0l9qBogK51.uORfsBYshfECAJrRvrkmYQ0P/oeo.9IDy','123',NULL,1,'2026-07-31 15:30:47.600219','2026-07-31 15:40:15.000000',NULL,'0ee0930a-4b65-4402-abd8-ad9be6d7e55a'),('9a60b920-ddaf-4695-acb9-a496aac83592','Demo User','user@nexus.com','$2b$10$yGKeMLas.JjCrHiMGn9.sOWND/EEHP1zIuWvn1QZCsNHrV0763s.y',NULL,NULL,1,'2026-07-31 14:46:17.157349','2026-07-31 16:46:43.000000',NULL,'b6f5e15f-91fb-44ef-b541-3eff7fd2e108'),('dddbbd07-8cb8-11f1-b23e-02d852a2efe7','Updated Name','admin@nexus.com','$2b$10$yFwx.ZtdN6kv2Rbb5bfBc.PkR10.sDsIsTThJ1JVyyOuXv4DUzoRy',NULL,NULL,1,'2026-07-31 15:21:44.000000','2026-07-31 15:40:00.879956',NULL,'0ee0930a-4b65-4402-abd8-ad9be6d7e55a');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'erp_lite'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-01  8:50:23
