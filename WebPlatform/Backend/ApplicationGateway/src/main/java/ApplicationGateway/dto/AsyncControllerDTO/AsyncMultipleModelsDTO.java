package ApplicationGateway.dto.AsyncControllerDTO;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class AsyncMultipleModelsDTO {

    private byte[] model;

    private List<String> deviceIds;
}
