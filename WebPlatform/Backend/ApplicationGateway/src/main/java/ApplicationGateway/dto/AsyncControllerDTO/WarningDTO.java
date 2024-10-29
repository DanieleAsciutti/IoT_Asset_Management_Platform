package ApplicationGateway.dto.AsyncControllerDTO;

import ApplicationGateway.dto.enums.Warning;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class WarningDTO {

    private String deviceId;

    private Warning warning;

    private String message;
}
