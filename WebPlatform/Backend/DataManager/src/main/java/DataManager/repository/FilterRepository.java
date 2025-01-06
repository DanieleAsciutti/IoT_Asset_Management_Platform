package DataManager.repository;

import DataManager.model.relDB.Filter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FilterRepository extends JpaRepository<Filter, Long> {

    // Trova tutti i filtri di livello 1
    @Query("SELECT DISTINCT f.name FROM Filter f WHERE f.parentLevel1 IS NULL AND f.parentLevel2 IS NULL")
    List<String> retrieveLevel1();

    // Trova tutti i filtri di livello 2 dati un livello 1 specifico
    @Query("SELECT DISTINCT f.name FROM Filter f WHERE f.parentLevel1.name = ?1 AND f.parentLevel2 IS NULL")
    List<String> retrieveLevel2(String level1);

    // Trova tutti i filtri di livello 3 dati i livelli 1 e 2 specifici
    @Query("SELECT DISTINCT f.name FROM Filter f WHERE f.parentLevel1.name = ?1 AND f.parentLevel2.name = ?2")
    List<String> retrieveLevel3(String level1, String level2);


    @Query("SELECT f FROM Filter f WHERE f.name = ?1 AND f.parentLevel1 IS NULL AND f.parentLevel2 IS NULL")
    List<Filter> findLevel1Filters(String name);

    @Query("SELECT f FROM Filter f WHERE f.name = ?1 AND f.parentLevel1.name = ?2 AND f.parentLevel2 IS NULL")
    List<Filter> findLevel2Filters(String name, String l1);

    @Query("SELECT f FROM Filter f WHERE f.name = ?1 AND f.parentLevel1.name = ?2 AND f.parentLevel2.name = ?3")
    List<Filter> findLevel3Filters(String name, String l1, String l2);


    @Query("SELECT COUNT(f) > 0 FROM Filter f WHERE f.parentLevel1.name = :level1Name AND f.parentLevel2 IS NULL AND f.name <> :level2Name")
    boolean existsOtherLevel2(@Param("level1Name") String level1Name, @Param("level2Name") String level2Name);

    @Query("SELECT COUNT(f) > 0 FROM Filter f WHERE f.parentLevel1.name = :level1Name AND f.parentLevel2.name = :level2Name " +
            "AND f.name <> :level3Name")
    boolean existsOtherLevel3(@Param("level1Name") String level1Name, @Param("level2Name") String level2Name, @Param("level3Name") String level3Name);

    @Query("SELECT f FROM Filter f WHERE f.parentLevel1.name = ?1 AND f.parentLevel2.name = ?2")
    List<Filter> findLevel3ByLevel1AndLevel2(String level1, String level2);


    @Modifying
    @Query("DELETE FROM Filter f WHERE f.parentLevel1.name = ?1")
    void deleteAllByLevel1(String level1);

    @Modifying
    @Query("DELETE FROM Filter f WHERE f.name= ?1 AND f.parentLevel1 IS NULL AND f.parentLevel2 IS NULL")
    void deleteLevel1ByName(String name);

    @Modifying
    @Query("DELETE FROM Filter f WHERE f.parentLevel1.name = ?1 AND f.parentLevel2 IS NULL AND f.name = ?2")
    void deleteAllLevel2ByLevel1(String level1, String level2);

    @Modifying
    @Query("DELETE FROM Filter f WHERE f.parentLevel1.name = ?1 AND f.parentLevel2.name = ?2")
    void deleteAllByParentLevel1NameAndParentLevel2Name(String level1, String level2);

    @Modifying
    @Query("DELETE FROM Filter f WHERE f.parentLevel1.name = ?1 AND f.parentLevel2.name = ?2 AND f.name = ?3")
    void deleteAllLevel3ByLevel1AndLevel2(String level1,  String level2, String level3);




}
