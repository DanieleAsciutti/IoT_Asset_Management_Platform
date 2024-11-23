package DataManager.repository;

import DataManager.model.relDB.RULWarningCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RULWarningCaseRepository extends JpaRepository<RULWarningCase, Long> {

    @Query("SELECT a FROM RULWarningCase a WHERE a.processed = ?1")
    List<RULWarningCase> findAllByProcessed(Boolean processed);
}
