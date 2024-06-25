package DataManager.repository;

import DataManager.model.graphDB.Device;

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

    @Query("CALL apoc.cypher.doIt($query, {name: $name})")
    void addAsset(@Param("query") String query, @Param("name") String name);

    @Query("MATCH (d) WHERE elementId(d) = $id DELETE d")
    void deleteAsset(@Param("id") String id);

    @Query("MATCH () - [r] - () WHERE elementId(r) = $id DELETE r")
    void deleteRelationship(@Param("id") String relId);

    @Query("MATCH (d) WHERE elementId(d) = $id RETURN apoc.convert.toJson({elementId: elementId(d), asset: d})")
    String getAsset(@Param("id") String id);

    @Query("MATCH (d:Device) WHERE d.isRegistered = false RETURN d")
    ArrayList<Device> getAllUnregisteredDevices();

    @Query("MATCH (d:Device) WHERE d.isRegistered = true RETURN apoc.convert.toJson({id: elementId(d), name: d.name, place: d.place, type: d.type, " +
            "status: d.status, regDate: d.registrationDate})")
    ArrayList<String> getAllRegisteredDevices();

    @Query("MATCH (d) WHERE elementId(d) = $id RETURN labels(d)[0] as labels")
    String getNodeLabelById(String id);

    @Query("MATCH (d:Device) WHERE elementId(d) = $id SET d.isRegistered = true, d.place = $place, d.type = $type, d.status = $status, d.registrationDate = $registrationDate")
    void registerDevice(String id, String place, String type, String status, String registrationDate);

    /*
    @Query("MATCH (d:Device) WHERE elementId(d) = $id SET d += $value")
    void setAttributes(String id, Map<String, String> value);ù
     */

    //"MATCH (d:"+label+") WHERE elementId(d) = $assetId SET d += $value"
    @Query("CALL apoc.cypher.doIt($query, {value: $value, assetId: $assetId})")
    void setAttributes(@Param("assetId") String assetId, @Param("value") Map<String, String> value, @Param("query") String query);

    @Query("CALL apoc.cypher.doIt($query, {id: $id })")
    void removeAttributes(@Param("id") String id, @Param("query") String query);

    @Query("MATCH (d:Device) WHERE elementId(d) = $id DELETE d")
    void deleteDeviceById(String id);

    //"MATCH (d:"+assetLabel+"), (t:"+targetLabel+") WHERE elementId(d) = $deviceId AND elementId(t) = $targetId CREATE (d)-[r:"+relationship+"]->(t)"
     @Query("CALL apoc.cypher.doIt($query, {deviceId: $deviceId, targetId: $targetId})")
    void addRelationship(@Param("deviceId") String deviceId, @Param("targetId") String targetId, @Param("query") String query);

     @Query("MATCH (d)-[r]-(t) WHERE elementId(r) = $relationshipId DELETE r")
     void removeRelationship(String relationshipId);

     @Query("MATCH (d) RETURN apoc.convert.toJson({id: elementId(d), name: d.name})")
     List<String> getAllNodesId();

     @Query("MATCH (d) WHERE d.label <> 'Device' OR  d.isRegistered = true RETURN apoc.convert.toJson({id: elementId(d), label: labels(d)[0], name: d.name, type: d.type, place: d.place})")
     List<String> getAssetsForNetwork();

     @Query("MATCH (d)-[r]-(t) RETURN apoc.convert.toJson({relId: elementId(r), label: type(r), source: elementId(d), target: elementId(t)})")
     List<String> getRelationsForNetwork();

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
}
