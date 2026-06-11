package com.cvrs.backend.repository;

import com.cvrs.backend.model.Vaccine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VaccineRepository extends JpaRepository<Vaccine, Long> {

    List<Vaccine> findByAgeInMonths(int ageInMonths);

    List<Vaccine> findByAgeInMonthsBetween(int minAge, int maxAge);

    List<Vaccine> findByAgeInMonthsLessThanEqual(int ageInMonths);

    List<Vaccine> findByAgeInMonthsGreaterThan(int ageInMonths);

    List<Vaccine> findByAgeInMonthsGreaterThanOrderByAgeInMonthsAsc(int ageInMonths);

    long countByAgeInMonthsLessThanEqual(int ageInMonths);

    long countByAgeInMonthsGreaterThan(int ageInMonths);

    List<String> findDistinctNameBy();

    boolean existsByName(String name);

    @Query("SELECT v FROM Vaccine v WHERE v.ageInMonths <= :maxAge ORDER BY v.ageInMonths ASC")
    List<Vaccine> findVaccinesUpToAge(@Param("maxAge") int maxAge);

    @Query("SELECT v FROM Vaccine v WHERE v.ageInMonths > :age ORDER BY v.ageInMonths ASC")
    List<Vaccine> findUpcomingVaccines(@Param("age") int age);
}