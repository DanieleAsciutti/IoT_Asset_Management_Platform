package DataManager.repository;

import DataManager.model.graphDB.Device;

import org.neo4j.driver.Result;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public interface AssetRepository extends Neo4jRepository<Device, String>{


    @Query("CREATE (d:Device {name: $name}) SET d.isRegistered = $isRegistered RETURN elementId(d)")
    String addDevice(String name, Boolean isRegistered);

    /*
    @Query("CREATE (m:MonitoringTarget {name: $name})")
    void addMonitoringTarget(String name);

     */

    @Query("CALL apoc.cypher.doIt($query, {name: $name, level1: $level1, level2: $level2, level3: $level3})")
    void addAsset(@Param("query") String query, @Param("name") String name, @Param("level1") String level1, @Param("level2") String level2, @Param("level3") String level3);

    @Query("MATCH (d) WHERE elementId(d) = $id DELETE d")
    String deleteAsset(@Param("id") String id);

    @Query("MATCH () - [r] - () WHERE elementId(r) = $id DELETE r")
    void deleteRelationship(@Param("id") String relId);

    @Query("MATCH (d) WHERE elementId(d) = $id RETURN apoc.convert.toJson({elementId: elementId(d), asset: d})")
    String getAsset(@Param("id") String id);

    @Query("MATCH (d:Device) WHERE d.isRegistered = false RETURN d")
    ArrayList<Device> getAllUnregisteredDevices();

    @Query("MATCH (d:Device) WHERE d.isRegistered = true RETURN apoc.convert.toJson({id: elementId(d), name: d.name, place: d.place, type: d.type, " +
            "status: d.status, regDate: d.registrationDate})")
    ArrayList<String> getAllRegisteredDevices();

    @Query("MATCH (d:Device) WHERE d.isRegistered = true AND d.level1 = $level1 AND d.level2 = $level2 AND d.level3 = $level3 RETURN " +
            "apoc.convert.toJson({id: elementId(d), name: d.name, place: d.place, type: d.type, " +
            "status: d.status, regDate: d.registrationDate})")
    ArrayList<String> getFilteredRegisteredDevices(String level1, String level2, String level3);

    @Query("MATCH (d) WHERE elementId(d) = $id RETURN labels(d)[0] as labels")
    String getNodeLabelById(String id);

    @Query("MATCH (d:Device) WHERE elementId(d) = $id SET d.isRegistered = true, d.place = $place, d.type = $type, d.status = $status, d.registrationDate = $registrationDate, d.level1 = $level1, d.level2 = $level2, d.level3 = $level3")
    void registerDevice(String id, String place, String type, String status, String registrationDate, String level1, String level2, String level3);


    //"MATCH (d:"+label+") WHERE elementId(d) = $assetId SET d += $value"
    @Query("CALL apoc.cypher.doIt($query, {value: $value, assetId: $assetId})")
    void setAttributes(@Param("assetId") String assetId, @Param("value") Map<String, String> value, @Param("query") String query);

    @Query("CALL apoc.cypher.doIt($query, {id: $id })")
    void removeAttributes(@Param("id") String id, @Param("query") String query);

    @Query("CALL apoc.cypher.doIt($query, {id: $id})")
    void modifyDeviceTag(@Param("id") String id, @Param("query") String query);

    @Query("MATCH (d:Device) RETURN DISTINCT d.tag")
    List<String> getAllDeviceTags();

    @Query("MATCH (d:Device) WHERE d.isRegistered = true AND d.tag = $tag RETURN " +
            "apoc.convert.toJson({id: elementId(d), name: d.name, place: d.place, type: d.type, " +
            "status: d.status, regDate: d.registrationDate})")
    List<String> getDevicesByTag(String tag);

    @Query("MATCH (d:Device) WHERE elementId(d) = $id DELETE d")
    void deleteDeviceById(String id);

    //"MATCH (d:"+assetLabel+"), (t:"+targetLabel+") WHERE elementId(d) = $deviceId AND elementId(t) = $targetId CREATE (d)-[r:"+relationship+"]->(t)"
     @Query("CALL apoc.cypher.doIt($query, {deviceId: $deviceId, targetId: $targetId})")
     void addRelationship(@Param("deviceId") String deviceId, @Param("targetId") String targetId, @Param("query") String query);

     @Query("MATCH (d) WHERE elementId(d) = $id RETURN apoc.convert.toJson({isReg: d.isRegistered, l1: d.level1, l2: d.level2, l3: d.level3})")
     String getLevels(@Param("id") String id);

     @Query("MATCH (d)-[r]-(t) WHERE elementId(r) = $relationshipId DELETE r")
     void removeRelationship(String relationshipId);

     @Query("MATCH (d) RETURN apoc.convert.toJson({id: elementId(d), name: d.name})")
     List<String> getAllNodesId();

     @Query("MATCH (d) WHERE d.label <> 'Device' OR  d.isRegistered = true RETURN apoc.convert.toJson({id: elementId(d), label: labels(d)[0], name: d.name, type: d.type, place: d.place})")
     List<String> getAssetsForNetwork();

     @Query("MATCH (d)-[r]-(t) RETURN apoc.convert.toJson({relId: elementId(r), label: type(r), source: elementId(d), target: elementId(t)})")
     List<String> getRelationsForNetwork();

     @Query("MATCH (d) WHERE d.level1 = $l1 AND d.level2 = $l2 AND d.level3 = $l3 AND (labels(d)[0] <> 'Device' OR  d.isRegistered = true) RETURN apoc.convert.toJson({id: elementId(d), label: labels(d)[0], name: d.name, type: d.type, place: d.place})")
     List<String> getFilteredAssetsForNetwork(@Param("l1") String l1, @Param("l2") String l2, @Param("l3") String l3);

     @Query("MATCH (d)-[r]-(t) WHERE d.level1 = $l1 AND d.level2 = $l2 AND d.level3 = $l3 AND t.level1 = $l1 AND t.level2 = $l2 AND t.level3 = $l3 RETURN apoc.convert.toJson({relId: elementId(r), label: type(r), source: elementId(d), target: elementId(t)})")
     List<String> getFilteredRelationsForNetwork(@Param("l1") String l1, @Param("l2") String l2, @Param("l3") String l3);

     @Query("MATCH (d) WHERE elementId(d) = $assetId RETURN d.modelPath")
     String retrieveModelPath(@Param("assetId") String assetId);

     @Query("MATCH (d) WHERE elementId(d) = $assetId SET d.modelPath = $modelPath")
     String addModelPath(@Param("assetId") String assetId, @Param("modelPath") String modelPath);

     @Query("MATCH (d:Device) WHERE elementId(d) = $assetId SET d.pendingRetrieve = $pendingRetrieve")
     void setPendingRetrieve(@Param("assetId") String assetId, @Param("pendingRetrieve") boolean pendingRetrieve);

     @Query("MATCH (d:Device) WHERE elementId(d) = $assetId SET d.pendingSend = $pendingSend")
     void setPendingSend(@Param("assetId") String assetId, @Param("pendingSend") boolean pendingSend);

     @Query("MATCH (d:Device) WHERE elementId(d) = $assetId SET d.pendingData = $pendingData")
     void setPendingData(@Param("assetId") String assetId, @Param("pendingData") boolean pendingData);

     @Query("MATCH (d:Device) WHERE elementId(d) = $assetId SET d.currentModel = $currentModel")
     void setCurrentModel(@Param("assetId") String assetId, @Param("currentModel") String currentModel);

     @Query("MATCH (d:Device) WHERE elementId(d) = $assetId SET d.pendingModel = $pendingModel")
     void setPendingModel(@Param("assetId") String assetId, @Param("pendingModel") String pendingModel);

     @Query("MATCH (d:Device) WHERE elementId(d) = $assetId RETURN d.pendingModel")
     String getPendingModel(@Param("assetId") String assetId);

     @Query("MATCH (d:Device) WHERE elementId(d) = $assetId RETURN apoc.convert.toJson({data: d.pendingData, retrieve: d.pendingRetrieve, send: d.pendingSend})")
     String getDevicePendings(@Param("assetId") String assetId);


     @Query("MATCH (n) RETURN DISTINCT n.level1")
     List<String> retrieveLevel1();

     @Query("MATCH (n) WHERE n.level1 = $level1 RETURN DISTINCT n.level2")
     List<String> retrieveLevel2(@Param("level1") String level1);

     @Query("MATCH (n) WHERE n.level1 = $level1 AND n.level2 = $level2 RETURN DISTINCT n.level3")
     List<String> retrieveLevel3(@Param("level1") String level1, @Param("level2") String level2);

     @Query("MATCH (n) WHERE n.level1 = $level1 AND n.level2 = $level2 AND n.level3 = $level3 RETURN COUNT(n) > 0 AS exists")
     Boolean existsByLevel1AndLevel2AndLevel3(String level1, String level2, String level3);

    @Query("CALL apoc.cypher.doIt($query, {})")
    List<Map<String, List<Map<String, Object>>>> getNodesDataByLevels(@Param("query") String query);

    @Query("CALL apoc.cypher.doIt($query, {})")
    void deleteNodesByLevels(@Param("query") String query);

    @Query("CALL apoc.cypher.doIt($query, {})")
    void modifyLevels(@Param("query") String query);

    /**
     * TO DELETE, IT NEEDS ONLY FOR PYTHON SCRIPT //TODO
     */
    @Query("CALL apoc.cypher.doIt($query, {name: $name, level1: $level1, level2: $level2, level3: $level3})")
    List<Map<String, Object>> pythonAddAsset(@Param("query") String query, @Param("name") String name, @Param("level1") String level1, @Param("level2") String level2, @Param("level3") String level3);

    /**
     * TO DELETE, IT NEEDS ONLY FOR PYTHON SCRIPT //TODO
     */
    @Query("MATCH (d) RETURN elementId(d)")
    List<String> retrieveAll();

}
