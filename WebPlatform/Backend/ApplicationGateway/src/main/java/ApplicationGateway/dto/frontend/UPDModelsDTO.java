package ApplicationGateway.dto.frontend;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class UPDModelsDTO {
    private List<String> deviceIds;
}
