package DataManager.dto.gateway.warnings;

import DataManager.dto.enums.Warning;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class DeviceWarningDTO {

    private String deviceId;

    private Warning warning;

    private String message;
}
