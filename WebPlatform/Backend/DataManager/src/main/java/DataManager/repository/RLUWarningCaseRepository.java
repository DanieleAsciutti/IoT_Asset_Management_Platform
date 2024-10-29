package DataManager.repository;

import DataManager.model.relDB.RLUWarningCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RLUWarningCaseRepository extends JpaRepository<RLUWarningCase, Long> {

    @Query("SELECT a FROM RLUWarningCase a WHERE a.processed = ?1")
    List<RLUWarningCase> findAllByProcessed(Boolean processed);
}
