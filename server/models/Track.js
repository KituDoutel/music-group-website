class Track {
    static async getAll() {
      const sql = `
        SELECT t.*, u.username as artist_name 
        FROM tracks t
        JOIN users u ON t.artist_id = u.id
        ORDER BY t.release_date DESC
      `;
      return await query(sql);
    }
  
    static async getById(id) {
      const sql = `
        SELECT t.*, u.username as artist_name 
        FROM tracks t
        JOIN users u ON t.artist_id = u.id
        WHERE t.id = ?
      `;
      const [track] = await query(sql, [id]);
      return track;
    }
  
    static async incrementStream(trackId) {
      const sql = 'UPDATE tracks SET stream_count = stream_count + 1 WHERE id = ?';
      await query(sql, [trackId]);
    }
  }
  
  module.exports = Track;