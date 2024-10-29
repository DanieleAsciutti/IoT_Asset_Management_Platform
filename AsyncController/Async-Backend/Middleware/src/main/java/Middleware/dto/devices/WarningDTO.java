package Middleware.dto.devices;

import Middleware.model.Warning;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class WarningDTO {

        private String deviceName;

        private Warning warning;

        private String message;
}
