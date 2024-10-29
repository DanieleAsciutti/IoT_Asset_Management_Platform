package Middleware.dto.server;

import Middleware.model.Warning;
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
