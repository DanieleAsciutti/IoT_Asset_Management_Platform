package DataManager.dto.asset;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@Getter
public class AddAssetDTO {

    private String name;

    private String label;

    private String level1;

    private String level2;

    private String level3;
}
