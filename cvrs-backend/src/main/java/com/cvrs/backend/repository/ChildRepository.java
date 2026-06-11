package com.cvrs.backend.repository;

import com.cvrs.backend.model.Child;
import com.cvrs.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChildRepository extends JpaRepository<Child, Long> {

    List<Child> findByParent(User parent);

    List<Child> findByParentAndIsDeleted(User parent, Integer isDeleted);

    default List<Child> findByParentAndIsDeletedFalse(User parent) {
        return findByParentAndIsDeleted(parent, 0);
    }

    List<Child> findByParentIdAndIsDeleted(Long parentId, Integer isDeleted);

    default List<Child> findByParentIdAndIsDeletedFalse(Long parentId) {
        return findByParentIdAndIsDeleted(parentId, 0);
    }

    List<Child> findByIsDeleted(Integer isDeleted);

    default List<Child> findByIsDeletedFalse() {
        return findByIsDeleted(0);
    }

    Optional<Child> findByIdAndIsDeleted(Long id, Integer isDeleted);

    default Optional<Child> findByIdAndIsDeletedFalse(Long id) {
        return findByIdAndIsDeleted(id, 0);
    }

    @Query("SELECT COUNT(c) FROM Child c WHERE c.isDeleted = 0")
    long countTotalChildren();

    @Query("SELECT c FROM Child c WHERE c.parent.id = :parentId AND c.isDeleted = 0")
    List<Child> findAllByParentId(@Param("parentId") Long parentId);

    @Query("SELECT c FROM Child c WHERE c.parent.email = :email AND c.isDeleted = 0")
    List<Child> findAllByParentEmail(@Param("email") String email);

    @Query("SELECT c FROM Child c WHERE c.dob BETWEEN :startDate AND :endDate AND c.isDeleted = 0")
    List<Child> findByDobBetween(@Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate);



    @Query("SELECT COUNT(c) FROM Child c WHERE c.createdAt BETWEEN :startDate AND :endDate")
    Long countByCreatedAtBetween(@Param("startDate") LocalDateTime startDate,
                                 @Param("endDate") LocalDateTime endDate);
}