package DataManager.repository;

import DataManager.model.relDB.AnomalyWarningCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AnomalyWarningCaseRepository extends JpaRepository<AnomalyWarningCase, Long> {

    @Query("SELECT a FROM AnomalyWarningCase a WHERE a.processed = ?1")
    List<AnomalyWarningCase> findAllByProcessed(Boolean processed);
}
