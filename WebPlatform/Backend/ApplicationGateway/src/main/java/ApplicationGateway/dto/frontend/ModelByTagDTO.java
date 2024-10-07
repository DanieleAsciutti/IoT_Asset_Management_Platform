package ApplicationGateway.dto.frontend;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class ModelByTagDTO {

    private byte[] model;

    private List<String> deviceIds;

    private String modelName;
}
