package ApplicationGateway.dto.assetManDTO;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class AddDeviceDTO {

    private String place;

    private String type;

    private String status;

    private String level1;

    private String level2;

    private String level3;

}