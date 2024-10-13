package ApplicationGateway.service;

import ApplicationGateway.dto.AsyncControllerDTO.AsyncModelDTO;
import ApplicationGateway.dto.AsyncControllerDTO.AsyncMultipleModelsDTO;
import ApplicationGateway.dto.AsyncControllerDTO.DeviceDataDTO;
import ApplicationGateway.dto.assetManDTO.*;
import ApplicationGateway.dto.auth_AuthDTO.*;
import ApplicationGateway.dto.dataManagerDTO.AddAssetDTO;
import ApplicationGateway.dto.dataManagerDTO.DeviceTagDTO;
import ApplicationGateway.dto.dataManagerDTO.MultiplePendingsDTO;
import ApplicationGateway.dto.dataManagerDTO.UserInfoDTO;
import ApplicationGateway.dto.enums.Pendings;
import ApplicationGateway.dto.frontend.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationGatewayService {

    @Value("${auth.address}")
    private String authAddress;

    @Value("${auth.port}")
    private int authPort;

    @Value("${assetManager.address}")
    private String assetManagerAddress;

    @Value("${assetManager.port}")
    private int assetManagerPort;

    @Value("${dataManager.address}")
    private String dataManagerAddress;

    @Value("${dataManager.port}")
    private int dataManagerPort;

    @Value("${asyncController.address}")
    private String asyncControllerAddress;

    @Value("${asyncController.port}")
    private int asyncControllerPort;


    private final WebClient webClient;

    public ApplicationGatewayService() {
        this.webClient = WebClient.builder().build();
    }

    public ResponseEntity<AuthenticationResponse> authenticate(AuthenticationRequest authenticationRequest){
        ResponseEntity<AuthenticationResponse> block = webClient
                .post()
                .uri(String.format("http://%s:%d/authenticate", authAddress, authPort))
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .body(Mono.just(authenticationRequest), AuthenticationRequest.class)
                .retrieve()
                .toEntity(AuthenticationResponse.class)
                .block();

        return ResponseEntity.status(Objects.requireNonNull(block).getStatusCode()).body(block.getBody());
    }

    public ResponseEntity<AuthorizationResponse> authorize(AuthorizationRequest authorizationRequest) {
        String p = String.format("http://%s:%d/authorize?", authAddress, authPort)
                + "accessToken=" + authorizationRequest.getAccessToken();

        ResponseEntity<AuthorizationResponse> block = webClient
                .get()
                .uri(p)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(AuthorizationResponse.class)
                .block();
        return ResponseEntity.status(Objects.requireNonNull(block).getStatusCode()).body(block.getBody());
    }

    public ResponseEntity<CompactUserDTO> getUsers() {
        String url = String.format("http://%s:%d/users", dataManagerAddress, dataManagerPort);
        ResponseEntity<List<UserInfoDTO>> response = webClient
                .get()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntityList(UserInfoDTO.class)
                .block();

        // Handle error or return an empty list
        if (Objects.requireNonNull(response).getStatusCode().is2xxSuccessful() && response.getBody() != null){
            CompactUserDTO compactUserDTO = new CompactUserDTO();
            for (UserInfoDTO userInfoDTO : response.getBody()){
                compactUserDTO.getUsers().add(userInfoDTO);
            }
            return ResponseEntity.ok(compactUserDTO);
        }
        else return ResponseEntity.status(401).build();
    }

    // Asset Management

    public ResponseEntity<String> addDevice(String name) {
        String url = String.format("http://%s:%d/addDevice?", assetManagerAddress, assetManagerPort) + "name=" + name;
        return webClient.post().uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(String.class)
                .block();
    }

    public ResponseEntity<String> getAsset(String id) {
        String url = String.format("http://%s:%d/getAsset?", assetManagerAddress, assetManagerPort)+"id="+id;

        return webClient.get()  // Using GET to fetch data
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)  // Setting Accept header as application/json
                .retrieve()
                .toEntity(String.class)
                .block();
    }

    public ResponseEntity<Void> addAsset(AddAssetDTO addAssetDTO)
    {
        String url = String.format("http://%s:%d/addAsset",dataManagerAddress, dataManagerPort);
        return webClient
                .post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(addAssetDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<Void> deleteAsset(String assetId)
    {
        String url = String.format("http://%s:%d/deleteAsset?",assetManagerAddress,assetManagerPort)+"id="+assetId;
        ResponseEntity<String> response =webClient
                .post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(String.class)
                .block();

        if(Objects.requireNonNull(response).getStatusCode().is2xxSuccessful() && response.getBody() != null){
            if(response.getBody().equals("Device")){
                url = String.format("http://%s:%d/ser/deleteDevice", asyncControllerAddress, asyncControllerPort);
                url += "?deviceId=" + assetId;
                return webClient.post()
                        .uri(url)
                        .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                        .retrieve()
                        .toEntity(Void.class)
                        .block();
            }
            else{
                return ResponseEntity.ok().build();
            }
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }

    public ResponseEntity<Void> deleteRelationship(String relId)
    {
        String url = String.format("http://%s:%d/deleteRelationship?",assetManagerAddress,assetManagerPort)+"relId="+relId;
        return webClient
                .post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<Void> addAttributes(String assetId, AttributesDTO attributes)
    {
        String url = String.format("http://%s:%d/addAttributes?",assetManagerAddress,assetManagerPort)+"assetId="+assetId;
        return webClient.post().uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(attributes)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<Void> removeAttributes(String assetId, NamesDTO names) {
        String url = String.format("http://%s:%d/addAttributes?",assetManagerAddress,assetManagerPort)+"assetId="+assetId;
        return webClient
                .post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<Void> modifyDeviceTag(DeviceTagDTO deviceTagDTO){
        String url = String.format("http://%s:%d/modifyDeviceTag", dataManagerAddress, dataManagerPort);

        return webClient
                .post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(deviceTagDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public List<String> getAllDeviceTags(){
        String url = String.format("http://%s:%d/getAllDeviceTags",dataManagerAddress, dataManagerPort);
        ResponseEntity<List<String>> response = webClient
                .get().uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(new ParameterizedTypeReference<List<String>>() {})
                .block();

        if (Objects.requireNonNull(response).getStatusCode().is2xxSuccessful() && response.getBody() != null) return response.getBody();
        else return Collections.emptyList();
    }

    public List<String> getDevicesByTag(String tag){
        String url = String.format("http://%s:%d/getDevicesByTag?",dataManagerAddress, dataManagerPort) + "tag=" + tag;
        ResponseEntity<List<String>> response = webClient
                .get().uri(url)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .toEntity(new ParameterizedTypeReference<List<String>>() {})
                .block();

        if (Objects.requireNonNull(response).getStatusCode().is2xxSuccessful() && response.getBody() != null) return response.getBody();
        else return Collections.emptyList();
    }

    public List<UnregisteredDeviceDTO> getAllUnregisteredDevices() {
        String url = String.format("http://%s:%d/getAllUnregisteredDevices",assetManagerAddress,assetManagerPort);
        ResponseEntity<List<UnregisteredDeviceDTO>> response = webClient
                .get()
                .uri(url).header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntityList(UnregisteredDeviceDTO.class)
                .block();

        // Handle error or return an empty list
        if (Objects.requireNonNull(response).getStatusCode().is2xxSuccessful() && response.getBody() != null) return response.getBody();
        else return Collections.emptyList();
    }

    public List<String> getAllRegisteredDevices() {
        String url = String.format("http://%s:%d/getAllRegisteredDevices",assetManagerAddress,assetManagerPort);
        ResponseEntity<List<String>> response = webClient
                .get().uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntityList(String.class)
                .block();


        // Handle error or return an empty list
        if (Objects.requireNonNull(response).getStatusCode().is2xxSuccessful() && response.getBody() != null) return response.getBody();
        else return Collections.emptyList();
    }

    public List<String> getFilteredRegisteredDevices(String l1, String l2, String l3) {
        String url = String.format("http://%s:%d/getFilteredRegisteredDevices?",dataManagerAddress, dataManagerPort) + "l1=" + l1 + "&l2=" + l2 + "&l3=" + l3;
        ResponseEntity<List<String>> response = webClient
                .get().uri(url)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .toEntity(new ParameterizedTypeReference<List<String>>() {})
                .block();

        // Handle error or return an empty list
        if (Objects.requireNonNull(response).getStatusCode().is2xxSuccessful() && response.getBody() != null) return response.getBody();
        else return Collections.emptyList();
    }

    public ResponseEntity<Void> registerDevice(String id, AddDeviceDTO addDeviceDTO)
    {
        String url = String.format("http://%s:%d/registerDevice?",dataManagerAddress, dataManagerPort)+"assetId="+id;
        return webClient
                .post()
                .uri(url).header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(addDeviceDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<Void> addRelationships(String assetId, RelationshipsDTO relationships) {
        String url = String.format("http://%s:%d/addRelationships?",assetManagerAddress,assetManagerPort)+"assetId="+assetId;
        return webClient
                .post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(relationships)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }


    public ResponseEntity<Void> removeRelationships(RelationshipsDTO relationships) {
        String url = String.format("http://%s:%d/removeRelationships",assetManagerAddress,assetManagerPort);
        return webClient
                .post()
                .uri(url).header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(relationships)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<String> getNetwork(){
        String url = String.format("http://%s:%d/getNetwork", assetManagerAddress, assetManagerPort);
        return webClient.get()  // Using GET to fetch data
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)  // Setting Accept header as application/json
                .retrieve()
                .toEntity(String.class)
                .block();
    }

    public ResponseEntity<String> getFilteredNetwork(String l1, String l2, String l3){
        String url = String.format("http://%s:%d/getFilteredNetwork", dataManagerAddress, dataManagerPort) + "?l1=" + l1 + "&l2=" + l2 + "&l3=" + l3;
        return webClient.get()  // Using GET to fetch data
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)  // Setting Accept header as application/json
                .retrieve()
                .toEntity(String.class)
                .block();
    }

    public List<Map<String, Object>> getNodesDataByLevels(String l1, String l2, String l3){
        String url = String.format("http://%s:%d/getNodesDataByLevels", dataManagerAddress, dataManagerPort) + "?l1=" + l1;
        if(l2 != null) {
            url += "&l2=" + l2;
            if(l3 != null)
                url += "&l3=" + l3;
        }
        ResponseEntity<List<Map<String,Object>>> response = webClient.get()
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .toEntity(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                .block();

        if (Objects.requireNonNull(response).getStatusCode().is2xxSuccessful() && response.getBody() != null) return response.getBody();
        else return Collections.emptyList();
    }

    public ResponseEntity<Void> deleteNodesByLevels(String l1, String l2, String l3){
        String url = String.format("http://%s:%d/deleteNodesByLevels?", dataManagerAddress, dataManagerPort) + "l1=" + l1;
        if(l2 != null) {
            url += "&l2=" + l2;
            if(l3 != null)
                url += "&l3=" + l3;
        }
        return webClient.post()
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<Void> modifyLevels(ModifyLevelsDTO modifyLevelsDTO){
        String url = String.format("http://%s:%d/modifyLevels", dataManagerAddress, dataManagerPort);
        return webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(modifyLevelsDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<Void> addUser(UserDTO userDTO){
        String url = String.format("http://%s:%d/addUser", dataManagerAddress, dataManagerPort);
        return webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(userDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<Void> deleteUser(long id){
        String url = String.format("http://%s:%d/deleteUser?", dataManagerAddress, dataManagerPort) +
                "id=" + id;
        return webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<Void> updateUserRole(long id, Role role){
        String url = String.format("http://%s:%d/updateUserRole?", dataManagerAddress, dataManagerPort) +
                "id=" + id + "&role=" + role;
        return webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<Void> addNewModel(ModelDTO modelDTO){
        if(checkPendings(modelDTO.getAssetId(), "send")){
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        NewModelDTO newModelDTO = NewModelDTO.builder()
                .model(modelDTO.getModel())
                .modelName(modelDTO.getModelName())
                .assetId(modelDTO.getAssetId())
                .fromUser(true)
                .build();

        String url = String.format("http://%s:%d/addNewModel", assetManagerAddress, assetManagerPort);
        ResponseEntity<Void> response =  webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(newModelDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();

        url = String.format("http://%s:%d/ser/updateModel", asyncControllerAddress, asyncControllerPort);
        AsyncModelDTO asyncModelDTO = AsyncModelDTO.builder()
                .model(modelDTO.getModel())
                .deviceId(modelDTO.getAssetId())
                .build();

        return webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(asyncModelDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();

    }

    public ResponseEntity<Void> addModelsByTag(ModelByTagDTO modelByTagDTO){

        String url = String.format("http://%s:%d/addModelsByTag", dataManagerAddress, dataManagerPort);
        ResponseEntity<Void> response =  webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(modelByTagDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();

        url = String.format("http://%s:%d/ser/updateMultipleModels", asyncControllerAddress, asyncControllerPort);
        AsyncMultipleModelsDTO asyncMultipleModelsDTO = AsyncMultipleModelsDTO.builder()
                .model(modelByTagDTO.getModel())
                .deviceIds(modelByTagDTO.getDeviceIds())
                .build();

        return webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(asyncMultipleModelsDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<Void> sendModel(ModelDTO modelDTO){
        NewModelDTO newModelDTO = new NewModelDTO(modelDTO.getModel(), modelDTO.getModelName(), modelDTO.getAssetId(), false);
        String url = String.format("http://%s:%d/addNewModel", assetManagerAddress, assetManagerPort);
        return webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(newModelDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<Void> updateModel(String deviceId){
        if(checkPendings(deviceId, "retrieve")){
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        String url = String.format("http://%s:%d/setPendingRetrieve?", dataManagerAddress, dataManagerPort) + "deviceId=" + deviceId + "&value=true";
        webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(Void.class)
                .block();

        url = String.format("http://%s:%d/ser/retrieveModel?", asyncControllerAddress, asyncControllerPort) + "deviceId=" + deviceId;
        return webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<Void> updateModelsByTag(DeviceIdsDTO deviceIdsDTO){

        MultiplePendingsDTO multiplePendingsDTO = MultiplePendingsDTO.builder()
                .deviceIds(deviceIdsDTO.getDeviceIds())
                .pending(Pendings.RETRIEVE)
                .value(true)
                .build();

        String url = String.format("http://%s:%d/setMultiplePending", dataManagerAddress, dataManagerPort);
        ResponseEntity<List<String>> response = webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(multiplePendingsDTO)
                .retrieve()
                .toEntity(new ParameterizedTypeReference<List<String>>() {})
                .block();

        if(!Objects.requireNonNull(response).getStatusCode().is2xxSuccessful() || response.getBody() == null){
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        if(response.getBody().isEmpty())
            return ResponseEntity.ok().build();


        url = String.format("http://%s:%d/ser/retrieveMultipleModels", asyncControllerAddress, asyncControllerPort);
        return webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(Collections.singletonMap("deviceIds", response.getBody()))
                .retrieve()
                .toEntity(Void.class)
                .block();


    }

    public ResponseEntity<Void> modelInserted(String deviceId){
        String url = String.format("http://%s:%d/modelInserted?", dataManagerAddress, dataManagerPort) + "deviceId=" + deviceId;
        return webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<Void> updateData(String deviceId){
        if(checkPendings(deviceId, "data")){
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        String url = String.format("http://%s:%d/setPendingData?", dataManagerAddress, dataManagerPort) + "deviceId=" + deviceId + "&value=true";
        webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(Void.class)
                .block();

        url = String.format("http://%s:%d/ser/retrieveData", asyncControllerAddress, asyncControllerPort) + "?deviceId=" + deviceId;
        return webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<Void> updateDataByTag(DeviceIdsDTO deviceIdsDTO){

        MultiplePendingsDTO multiplePendingsDTO = MultiplePendingsDTO.builder()
                .deviceIds(deviceIdsDTO.getDeviceIds())
                .pending(Pendings.DATA)
                .value(true)
                .build();

        String url = String.format("http://%s:%d/setMultiplePending", dataManagerAddress, dataManagerPort);
        ResponseEntity<List<String>> response = webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(multiplePendingsDTO)
                .retrieve()
                .toEntity(new ParameterizedTypeReference<List<String>>() {})
                .block();

        if(!Objects.requireNonNull(response).getStatusCode().is2xxSuccessful() || response.getBody() == null){
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        if(response.getBody().isEmpty())
            return ResponseEntity.ok().build();

        url = String.format("http://%s:%d/ser/retrieveMultipleData", asyncControllerAddress, asyncControllerPort);
        return webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(Collections.singletonMap("deviceIds", response.getBody()))
                .retrieve()
                .toEntity(Void.class)
                .block();

    }

    public ResponseEntity<Void> saveDeviceData(DeviceDataDTO deviceDataDTO){
        String url = String.format("http://%s:%d/saveDeviceData", assetManagerAddress, assetManagerPort);
        return webClient.post()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(deviceDataDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }

    public ResponseEntity<String> getDeviceModelsHistory(String deviceId){
        String url = String.format("http://%s:%d/getDeviceModelsHistory?", assetManagerAddress, assetManagerPort) + "deviceId=" + deviceId;
        return webClient.get()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(String.class)
                .block();
    }

    public ResponseEntity<byte[]> retrieveModel(String deviceId, String modelName, Boolean fromUser){
        String url = String.format("http://%s:%d/retrieveModel?", assetManagerAddress, assetManagerPort) + "deviceId=" + deviceId + "&modelName=" + modelName + "&fromUser=" + fromUser;
        return webClient.get()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(byte[].class)
                .block();
    }

    public boolean checkPendings(String deviceId, String toCheck){
        String url = String.format("http://%s:%d/getDevicePendings?", assetManagerAddress, assetManagerPort) + "deviceId=" + deviceId;
        ResponseEntity<PendingDeviceDTO> response = webClient.get()
                .uri(url)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(PendingDeviceDTO.class)
                .block();

        PendingDeviceDTO pendings = response.getBody();
        if (toCheck.equals("data")){
            return pendings.isPendingData();
        }
        else if (toCheck.equals("retrieve")){
            return pendings.isPendingRetrieve();
        }
        else if (toCheck.equals("send")){
            return pendings.isPendingSend();
        }
        return true;
    }

    public ResponseEntity<String> retrieveDeviceDataMetadata(String deviceId, String measurement) {
        String url = String.format("http://%s:%d/retrieveDeviceDataMetadata?", assetManagerAddress, assetManagerPort) + "deviceId=" + deviceId + "&measurement=" + measurement;

        return  webClient.get()
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .toEntity(String.class)
                .block();
    }

    public ResponseEntity<String> retrieveDeviceDataMeasurements(String deviceId) {
        String url = String.format("http://%s:%d/retrieveDeviceDataMeasurements?", assetManagerAddress, assetManagerPort) + "deviceId=" + deviceId;

        return  webClient.get()
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .toEntity(String.class)
                .block();
    }


    public ResponseEntity<InputStreamResource> downloadDeviceData(String deviceId) {
        String url = String.format("http://%s:%d/downloadDeviceData?deviceId=%s", assetManagerAddress, assetManagerPort, deviceId);

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

    public  List<String> getLevel1(){
        String url = String.format("http://%s:%d/getLevel1", dataManagerAddress, dataManagerPort);
        ResponseEntity<List<String>> response = webClient.get()
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .toEntity(new ParameterizedTypeReference<List<String>>() {})
                .block();


        if (Objects.requireNonNull(response).getStatusCode().is2xxSuccessful() && response.getBody() != null) return response.getBody();
        else return Collections.emptyList();
    }

    public List<String> getLevel2(String level1){
        String url = String.format("http://%s:%d/getLevel2?", dataManagerAddress, dataManagerPort) + "level1=" + level1;
        ResponseEntity<List<String>> response = webClient.get()
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .toEntity(new ParameterizedTypeReference<List<String>>() {})
                .block();
        if (Objects.requireNonNull(response).getStatusCode().is2xxSuccessful() && response.getBody() != null) return response.getBody();
        else return Collections.emptyList();
    }

    public List<String> getLevel3(String level1, String level2){
        String url = String.format("http://%s:%d/getLevel3?", dataManagerAddress, dataManagerPort) + "level1=" + level1 + "&level2=" + level2;
        ResponseEntity<List<String>> response = webClient.get()
                .uri(url)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .toEntity(new ParameterizedTypeReference<List<String>>() {})
                .block();
        if (Objects.requireNonNull(response).getStatusCode().is2xxSuccessful() && response.getBody() != null) return response.getBody();
        else return Collections.emptyList();
    }

}
