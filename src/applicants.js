const nodemon = require("nodemon");
const { pool } = require("../initial");
const mysql = require("mysql2/promise"); // ✅
const bcrypt = require('bcryptjs');

const getApplicants = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const queryStr = `
    SELECT 
      id,
      apply_date,
      position_applied,
      department,
      company,
      title,
      first_name,
      last_name,
      phone,
      national_id,
      employee_code,
      expected_salary,
      education_level,
      birth_date,
      age,
      previous_company,
      language_skills,
      applied_before, 
      blacklist,
      distance_km,
      start_work_within_6_days,
      note,
      created_at,
      updated_at,
      state_name as interview_status
    FROM job_applicants
    LEFT JOIN recruit_state ON job_applicants.interview_status = recruit_state.state_id
    ORDER BY interview_status ASC , apply_date DESC 
    LIMIT ? OFFSET ?
  `;

  try {
    const [rows] = await pool.query(queryStr, [limit, offset]);
    const [[{ total }]] = await pool.query(
  `SELECT COUNT(*) AS total FROM job_applicants`
);
    return {
      status: 200,
      page,
      limit,
      count: rows.length,
      totalPages: Math.ceil(total / limit),
      msg: rows
    };
  } catch (error) {
    console.error("Error getApplicants:", error);
    return { status: 500, msg: error };
  }
};



const insert_interview = async (data) => {
  const conn = await pool.getConnection();
  console.log(data, "kkkkkkkkkkkkkkkk");
  try {
    await conn.beginTransaction();
    let queryStr = ''
    let result = [];
    // ✅ Insert parent
     queryStr = `
      INSERT INTO interviews (applicant_id, interview_date, interview_time, location, note)
      VALUES (?, ?, ?, ?, ?)
    `;
     [result] = await conn.query(queryStr, [
      data.applicant_id,
      data.date,
      data.time,
      data.location,
      data.note
    ]);
      queryStr = `
      UPDATE job_applicants SET interview_status = 3 WHERE id = ?
    `;
     [result] = await conn.query(queryStr, [
      data.applicant_id
    ]); 
 
    await conn.commit();
    return { status: 200, msg: "success"};
  } catch (err) {
    await conn.rollback();
    console.error("Error in transaction:", err);
    return { status: 400, msg: err };
  } finally {
    conn.release();
  }
};



const update_interview = async (id , state) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let queryStr = ''
    let result = [];
    // ✅ Insert paren
      queryStr = `
      UPDATE job_applicants SET interview_status = ? WHERE id = ?
    `;
     [result] = await conn.query(queryStr, [
      state,
      id
    ]); 
 
    await conn.commit();
    return { status: 200, msg: "success"};
  } catch (err) {
    await conn.rollback();
    console.error("Error in transaction:", err);
    return { status: 400, msg: err };
  } finally {
    conn.release();
  }
};




const insert_jobsApplicants = async (data) => {
  const conn = await pool.getConnection();
  console.log(data, "kkkkkkkkkkkkkkkk");
  try {
    await conn.beginTransaction();
    let queryStr = ''
    let result = [];

    for(let add of data){
      
        // ✅ Insert parent
        queryStr = `
      INSERT INTO job_applicants (
        apply_date,
      position_applied,
      department,
      company,
      title,
      first_name,
      last_name,
      phone,
      national_id,
      interview_status,
      employee_code,
      expected_salary,
      education_level,
      birth_date,
      age,
      previous_company,
      language_skills,
      applied_before, 
      blacklist,
      distance_km,
      start_work_within_6_days,
      note,
      nickname
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      [result] = await conn.query(queryStr, [
          
          add.apply_date,
          add.position_applied,
          add.department,
          add.company,
          add.title,
          add.first_name,
          add.last_name,
      add.phone,
      add.national_id,
      add.interview_status,
      add.employee_code,
      add.expected_salary,
      add.education_level,
      add.birth_date,
      add.age,
      add.previous_company,
      add.language_skills,
      add.applied_before, 
      add.blacklist,
      add.distance_km,
      add.start_work_within_6_days,
      add.note,
      add.nickname
      
    ]);
}
    await conn.commit();
    return { status: 200, msg: "success"};
  } catch (err) {
    await conn.rollback();
    console.error("Error in transaction:", err);
    return { status: 400, msg: err };
  } finally {
    conn.release();
  }
};















const getDataInterview = async () => {

  const queryStr = `
      SELECT 
      job_applicants.id,
      apply_date,
      position_applied,
      department,
      company,
      title,
      first_name,
      last_name,
      phone,
      national_id,
      employee_code,
      expected_salary,
      education_level,
      birth_date,
      age,
      previous_company,
      language_skills,
      applied_before, 
      blacklist,
      distance_km,
      start_work_within_6_days,
      updated_at,
      state_name as interview_status,
      interviews.interview_date,
      interviews.interview_time,
      interviews.location,
      interviews.created_at,
      interviews.note
    FROM job_applicants
    INNER JOIN recruit_state ON job_applicants.interview_status = recruit_state.state_id
    INNER JOIN interviews ON job_applicants.id = interviews.applicant_id
    WHERE recruit_state.state_id = 3
    ORDER BY created_at DESC
  `;

  try {
    const [rows] = await pool.query(queryStr);
    const [[{ total }]] = await pool.query(
  `SELECT COUNT(*) AS total FROM job_applicants`
);
    return {
      status: 200,
      msg: rows
    };
  } catch (error) {
    console.error("Error getApplicants:", error);
    return { status: 500, msg: error };
  }
};










const Myrequest_transaction = async (emp_code) => {
  const queryStr = `
     WITH camera_list AS (
    SELECT
        transaction_items.transaction_id,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', transaction_items.id,
                'transaction_id', transaction_items.transaction_id,
                'status', transaction_items.status,
                'qty', transaction_items.qty,
                'remark', transaction_items.remark,
                'item_id', transaction_items.item_id,
                'camera_id', transaction_items.camera_id,
                'camera_point', camera_zone.camera_point,
                'camera_zone', camera_zone.camera_zone,
                'camera_qty', camera_zone.camera_qty,
                'camera_brand', camera_zone.camera_brand,
                'zone', zone.zone_name
            )
            ORDER BY transaction_items.camera_id ASC   -- ✅ MariaDB รองรับ ORDER BY ใน JSON_ARRAYAGG
        ) as lists
    FROM transaction_items
    INNER JOIN camera_zone 
        ON transaction_items.camera_id = camera_zone.camera_id
    INNER JOIN zone 
        ON camera_zone.camera_zone = zone.zone_id
--     WHERE transaction_items.transaction_id = 1
    GROUP BY transaction_items.transaction_id
        ORDER BY transaction_items.camera_id ASC

)
SELECT 
    transaction_checklist.transaction_id,
    transaction_checklist.ticket_name,
    transaction_checklist.start_date,
    transaction_checklist.end_date,
    transaction_checklist.complete_date,
    transaction_checklist.emp_code,
    transaction_checklist.completed,
    camera_list.lists,
    zone.zone_name
FROM transaction_checklist
INNER JOIN camera_list 
    ON transaction_checklist.transaction_id = camera_list.transaction_id
    INNER JOIN transaction_items ON transaction_checklist.transaction_id = transaction_items.transaction_id
    left JOIN camera_zone ON transaction_items.camera_id = camera_zone.camera_zone
    left JOIN zone ON camera_zone.camera_zone = zone.zone_id 
WHERE transaction_checklist.emp_code = ?
GROUP BY transaction_checklist.transaction_id;
  `;
const queryValues = [emp_code];
  try {
    const [rows, fields] = await pool.query(queryStr, queryValues);
    if (rows.length < 1) {
      return { status: 202, msg: [] };
    }
    return { status: 200, msg: rows };
  } catch (error) {
    console.log("Error Function getZone(): " + error);
    return { status: 201, msg: error };
  }
};







module.exports = {
 
  getApplicants,
  insert_interview,
  getDataInterview,
  update_interview,
  insert_jobsApplicants
};
