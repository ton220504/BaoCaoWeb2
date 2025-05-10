package com.tranvantoan.example205.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tranvantoan.example205.entity.Topic;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Integer> {  // ✅ Interface đúng chuẩn
    List<Topic> findByStatus(Integer status);
}
