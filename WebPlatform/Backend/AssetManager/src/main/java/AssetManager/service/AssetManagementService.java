package AssetManager.service;

import AssetManager.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.reactive.function.client.WebClient;


import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssetManagementService
{
    @Value("${datamanager.address}")
    private String dataControllerAddress;

    @Value("${datamanager.port}")
    private int dataControllerPort;
    private final WebClient webClient;

    public AssetManagementService()
    {
        this.webClient= WebClient.builder().build();
    }

    public ResponseEntity<String> addDevice(String name)
    {
        String url = String.format("http://%s:%d/addDevice?",dataControllerAddress,dataControllerPort)+"name="+name;
        return webClient.post().uri(url).
                header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(String.class)
                .block();
    }


    public ResponseEntity<Void> addAsset(String name, String label)
    {
        String url = String.format("http://%s:%d/addAsset?",dataControllerAddress,dataControllerPort)+"name="+name+"&label="+label;
        return webClient.post().uri(url).header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<String> getAsset(String id) {
        String url = String.format("http://%s:%d/getAsset?", dataControllerAddress, dataControllerPort)+"id="+id;

        return webClient.get()  // Using GET to fetch data
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)  // Setting Accept header as application/json
                .retrieve()
                .toEntity(String.class)
                .block();
    }


    public ResponseEntity<String> deleteAsset(String name) {
        String url = String.format("http://%s:%d/deleteAsset?",dataControllerAddress,dataControllerPort)+"id="+name;

        return webClient.post().uri(url).header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(String.class)
                .block();
    }

    public ResponseEntity<Void> deleteRelationship(String relId) {
        String url = String.format("http://%s:%d/deleteRelationship?",dataControllerAddress,dataControllerPort)+"relId="+relId;

        return webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }


    public ResponseEntity<Void> addAttributes(String assetId, AttributesDTO attributesDTO) {
        String url = String.format("http://%s:%d/addAttributes?", dataControllerAddress, dataControllerPort)+"assetId="+assetId;

        return webClient.post().uri(url).header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(attributesDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }


    public ResponseEntity<Void> removeAttributes(String assetId, NamesDTO namesDTO) {
        String url = String.format("http://%s:%d/removeAttributes?", dataControllerAddress, dataControllerPort)+"id="+assetId;

        return webClient.post().uri(url).header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(namesDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }


    public ResponseEntity<List<String>> getAllDevices() {
        String url = String.format("http://%s:%d/getAllDevices", dataControllerAddress, dataControllerPort);

        return webClient.get()  // Using GET to fetch data
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)  // Setting Accept header as application/json
                .retrieve()
                .toEntityList(String.class)
                .block();
    }

    public ResponseEntity<List<String>> getDeviceAttributes(String id) {
        String url = String.format("http://%s:%d/getDeviceAttributes?", dataControllerAddress, dataControllerPort)+"id="+id;

        return webClient.get()  // Using GET to fetch data
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)  // Setting Accept header as application/json
                .retrieve()
                .toEntityList(String.class)
                .block();
    }

    public ResponseEntity<List<UnregisteredDeviceDTO>> getAllUnregisteredDevices() {
        String url = String.format("http://%s:%d/getAllUnregisteredDevices", dataControllerAddress, dataControllerPort);

        return webClient.get()  // Using GET to fetch data
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)  // Setting Accept header as application/json
                .retrieve()
                .toEntityList(UnregisteredDeviceDTO.class)
                .block();
    }

    public ResponseEntity<List<String>> getAllRegisteredDevices() {
        String url = String.format("http://%s:%d/getAllRegisteredDevices", dataControllerAddress, dataControllerPort);

        return  webClient.get()  // Using GET to fetch data
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)  // Setting Accept header as application/json
                .retrieve()
                .toEntityList(String.class)
                .block();
    }

    public ResponseEntity<Void> registerDevice(String id, DeviceDTO deviceDTO)
    {
        String url = String.format("http://%s:%d/registerDevice?", dataControllerAddress, dataControllerPort)+"assetId="+id;

        return webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(deviceDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }


    public ResponseEntity<Void> addRelationships(String assetId, RelationshipsDTO relationshipsDTO) {
        String url = String.format("http://%s:%d/addRelationships?", dataControllerAddress, dataControllerPort)+"assetId="+assetId;

        return webClient.post()  // Using POST as this involves creating new relationships
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(relationshipsDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }



    public ResponseEntity<Void> removeRelationships(RelNamesDTO relNamesDTO) {
        String url = String.format("http://%s:%d/removeRelationships?", dataControllerAddress, dataControllerPort);

        return webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(relNamesDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<String> getNetwork() {
        String url = String.format("http://%s:%d/getNetwork", dataControllerAddress, dataControllerPort);

        return webClient.get()  // Using GET to fetch data
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)  // Setting Accept header as application/json
                .retrieve()
                .toEntity(String.class)
                .block();
    }

    public ResponseEntity<Void> addNewModel(ModelDTO modelDTO) {
        String url = String.format("http://%s:%d/addNewModel", dataControllerAddress, dataControllerPort);

        return webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(modelDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<Void> modelInserted(String deviceId) {
        String url = String.format("http://%s:%d/modelInserted?", dataControllerAddress, dataControllerPort)+"deviceId="+deviceId;

        return webClient.post()
                .uri(url)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<Void> saveDeviceData(DeviceDataDTO deviceDataDTO) {
        String url = String.format("http://%s:%d/saveDeviceData", dataControllerAddress, dataControllerPort);

        return webClient.post()
                .uri(url)
                .bodyValue(deviceDataDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<String> getDeviceModelsHistory(String deviceId) {
        String url = String.format("http://%s:%d/getDeviceModelsHistory?", dataControllerAddress, dataControllerPort)+"deviceId="+deviceId;

        return webClient.get()  // Using GET to fetch data
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)  // Setting Accept header as application/json
                .retrieve()
                .toEntity(String.class)
                .block();
    }

    public ResponseEntity<PendingDeviceDTO> getDevicePendings(String deviceId) {
        String url = String.format("http://%s:%d/getDevicePendings?", dataControllerAddress, dataControllerPort)+"deviceId="+deviceId;

        return webClient.get()  // Using GET to fetch data
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)  // Setting Accept header as application/json
                .retrieve()
                .toEntity(PendingDeviceDTO.class)
                .block();
    }

    public ResponseEntity<byte[]> retrieveModel(String deviceId, String modelName, Boolean fromUser) {
        String url = String.format("http://%s:%d/retrieveModel?", dataControllerAddress, dataControllerPort)+"deviceId="+deviceId+"&modelName="+modelName+"&fromUser="+fromUser;

        return webClient.get()  // Using GET to fetch data
                .uri(url)
                .accept(MediaType.APPLICATION_OCTET_STREAM)  // Setting Accept header as application/octet-stream
                .retrieve()
                .toEntity(byte[].class)
                .block();
    }

    public ResponseEntity<String> retrieveDeviceDataMetadata(String deviceId, String measurement) {
        String url = String.format("http://%s:%d/retrieveDeviceDataMetadata?", dataControllerAddress, dataControllerPort) + "deviceId=" + deviceId + "&measurement=" + measurement;

        return  webClient.get()  // Using GET to fetch data
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .toEntity(String.class)
                .block();
    }

    public ResponseEntity<String> retrieveDeviceDataMeasurements(String deviceId) {
        String url = String.format("http://%s:%d/retrieveDeviceDataMeasurements?", dataControllerAddress, dataControllerPort) + "deviceId=" + deviceId;

        return  webClient.get()  // Using GET to fetch data
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .toEntity(String.class)
                .block();
    }

    public ResponseEntity<InputStreamResource> downloadDeviceData(String deviceId) {
        String url = String.format("http://%s:%d/downloadDeviceData?deviceId=%s", dataControllerAddress, dataControllerPort, deviceId);

        InputStreamResource resource = webClient.get()
                .uri(url)
                .accept(MediaType.APPLICATION_OCTET_STREAM)
                .retrieve()
                .bodyToMono(InputStreamResource.class)
                .block();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=device_data.zip")
                .header("X-Accel-Buffering", "no")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

}

