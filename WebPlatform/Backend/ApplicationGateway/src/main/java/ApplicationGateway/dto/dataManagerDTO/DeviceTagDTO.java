package ApplicationGateway.dto.dataManagerDTO;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class DeviceTagDTO {

    private String deviceId;

    private String tag;
}
