package Middleware.service;

import Middleware.dto.devices.SendDataDTO;
import Middleware.dto.devices.SendModelDTO;
import Middleware.dto.server.DeviceDataDTO;
import Middleware.dto.server.ModelDTO;
import Middleware.dto.server.NewModelDTO;
import Middleware.model.Request;
import Middleware.model.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MiddlewareService {

    private final WebClient webClient;


    @Value("${gateway.address}")
    private String gatewayAddress;

    @Value("${gateway.port}")
    private int gatewayPort;

    private String dataPath = "/middleware_data/";

    private String csvFileName = "devices.csv";

    private final ArrayList<Request> pendingRequests = new ArrayList<>();

    private final ArrayList<ModelDTO> models = new ArrayList<>();


    public MiddlewareService(){
        this.webClient = WebClient.builder().build();
    }

    @Async
    public void asyncAddDevice(String deviceName){
        String uri = String.format("http://%s:%d/addDevice?name=%s", gatewayAddress, gatewayPort, deviceName);
        ResponseEntity<String> response = webClient.post()
                .uri(uri)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .retrieve()
                .toEntity(String.class)
                .block();

        if(response == null){
            log.error("Error adding device");
            return;
        }
        updateCSV(response.getBody(), deviceName);
    }

    @Async
    public void asyncSendModel(SendModelDTO sendModelDTO){
        String deviceId = findIdByName(sendModelDTO.getDeviceName());
        if(deviceId == null){
            log.error("Device not found");
            return;
        }
        NewModelDTO newModelDTO = new NewModelDTO(sendModelDTO.getModel(), deviceId, sendModelDTO.getModelName());
        String uri = String.format("http://%s:%d/sendModel", gatewayAddress, gatewayPort);
        webClient.post()
                .uri(uri)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(newModelDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();

        removePendingRequest(Response.RETRIEVE_MODEL, sendModelDTO.getDeviceName());
    }

    @Async
    public void asyncSendData(SendDataDTO sendDataDTO){
        String deviceId = findIdByName(sendDataDTO.getDeviceName());
        if(deviceId == null){
            log.error("Device not found");
            return;
        }
        Map<String, String> newData = changeDeviceIdInData(sendDataDTO.getData(), deviceId);
        DeviceDataDTO deviceDataDTO = new DeviceDataDTO(deviceId, newData);
        String uri = String.format("http://%s:%d/sendData", gatewayAddress, gatewayPort);
        webClient.post()
                .uri(uri)
                .bodyValue(deviceDataDTO)
                .retrieve()
                .toEntity(Void.class)
                .block();

        removePendingRequest(Response.RETRIEVE_DATA, sendDataDTO.getDeviceName());
    }

    public void updateModel(ModelDTO modelDTO){
        String name = findNameById(modelDTO.getDeviceId());
        if(name == null){
            log.error("Device not found");
            return;
        }
        addPendingRequest(new Request(name, Response.UPDATE_MODEL));
        models.add(modelDTO);
    }

    public void updateCSV(String deviceId, String deviceName){

        try(FileWriter writer = new FileWriter(dataPath + csvFileName, true)){
            writer.write(deviceId + "," + deviceName + "\n");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public String findNameById(String deviceId){

        try (BufferedReader reader = new BufferedReader(new FileReader(dataPath + csvFileName))){
            String line;
            while((line = reader.readLine()) != null){
                String[] data = line.split(",");
                if(data[0].equals(deviceId)){
                    return data[1];
                }
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return null;
    }

    public String findIdByName(String deviceName){

        try (BufferedReader reader = new BufferedReader(new FileReader(dataPath + csvFileName))){
            String line;
            while((line = reader.readLine()) != null){
                String[] data = line.split(",");
                if(data[1].equals(deviceName)){
                    return data[0];
                }
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return null;
    }

    public String checkPendingRequests(String deviceName){
        for(Request request : pendingRequests){
            //System.out.println(request.getDeviceName() + " " + request.getResponse());
            if(request.getDeviceName().equals(deviceName)){
                return request.getResponse().toString();
            }
        }
        return Response.NONE.toString();
    }

    public void removePendingRequest(Response response, String deviceName){
        for(Request req : pendingRequests){
            if(req.getResponse().equals(response) && req.getDeviceName().equals(deviceName)){
                pendingRequests.remove(req);
                return;
            }
        }
    }

    public byte[] retrieveModel(String deviceName){
        String deviceId = findIdByName(deviceName);
        if(deviceId == null){
            log.error("Device not found");
            return null;
        }
        for(ModelDTO model : models){
            if(model.getDeviceId().equals(deviceId)){
                models.remove(model);
                return model.getModel();
            }
        }
        return null;
    }

    public void addPendingRequest(Request request){
        //System.out.println("Adding request"); //TODO remove
        pendingRequests.add(request);
    }

    public void modelInserted(String deviceName){
        String deviceId = findIdByName(deviceName);
        String url = String.format("http://%s:%d/modelInserted?deviceId=%s", gatewayAddress, gatewayPort, deviceId);
        webClient.post()
                .uri(url)
                .retrieve()
                .toEntity(Void.class)
                .block();
    }


    public Map<String, String> changeDeviceIdInData(Map<String, String> data, String deviceId){
        Map<String, String> newData = new HashMap<>();
        for (Map.Entry<String, String> entry : data.entrySet()) {
            newData.put(entry.getKey(), entry.getValue().replaceAll("learning_device_id=([^ ,]+)", "learning_device_id="+ deviceId));
        }
        return newData;
    }


}
