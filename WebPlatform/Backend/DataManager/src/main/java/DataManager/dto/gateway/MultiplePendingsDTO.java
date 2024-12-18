package DataManager.dto.gateway;

import DataManager.dto.enums.Pendings;
import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class MultiplePendingsDTO {

    private List<String> deviceIds;
    private Pendings pending;
    private Boolean value;
}
