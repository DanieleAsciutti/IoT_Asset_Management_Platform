package DataManager.dto.gateway;

import lombok.*;

import java.util.Optional;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class LevelsDTO {

    private String level1;
    private String level2;
    private String level3;
}
