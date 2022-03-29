const { Op } = require("sequelize");
const db = require("../models");

const getBookingStatusFilter = async (paginate, filterBookingStatus, userId) => {
  if (filterBookingStatus) {
    const countBookingStatusFilter = await db.Order.count({
      where: {
        [Op.and]: {
          user_id: {
            [Op.eq] : userId
          },
          booking_status: {
            [Op.eq]: filterBookingStatus
          }
        }
      },
    });
  
    if (countBookingStatusFilter == 0) {
      return res.status(400).json({
        message: "Not found booking status",
      });
    };
  
    const BookingStatusFilter = await db.Order.findAll({
      where: {
        [Op.and]: {
          user_id: {
            [Op.eq] : userId
          },
          booking_status: {
            [Op.eq]: filterBookingStatus
          }
        }
      }, include: [
        {
          model: db.Car,
          as: 'Car', include: [
            {model: db.Image_car}
          ]
        }, {
          model: db.User,
          as: 'User',
          attributes:['email','first_name','last_name','phone_number']
        }
      ],
      offset: paginate.offset,
      limit: paginate.limit,
    });
    return {
      data: BookingStatusFilter,
      total: countBookingStatusFilter,
      offset: paginate.offset,
      limit: paginate.limit,
    };
  } else {
    const countBooking = await db.Order.count({
      where: {
          user_id: {
            [Op.eq] : userId
          }
      },
    });
  
    if (countBooking == 0) {
      return res.status(400).json({
        message: "Not found booking status",
      });
    };
  
    const Booking = await db.Order.findAll({
      where: {
          user_id: {
            [Op.eq] : userId
          }
      }, include: [
        {
          model: db.Car,
          as: 'Car', include: [
            {model: db.Image_car}
          ]
        }, {
          model: db.User,
          as: 'User',
          attributes:['email','first_name','last_name','phone_number']
        }
      ],
      offset: paginate.offset,
      limit: paginate.limit,
    });
    return {
      data: Booking,
      total: countBooking,
      offset: paginate.offset,
      limit: paginate.limit,
    };
  }
}

exports.getBookingList = async (req, res, next) => {
    try {
      /**
       * 1. Query Data Booking(Order) by userId include model (user, billing, car)
       * 2. return data
       * note frontend GET all Booking of user find Order include order include car ?booking_status
       */
      const { booking_status } = req.query;
      const userId = req.user.id;
      const offset = Number(req.query["offset"]);
      const limit = Number(req.query["limit"]);
      const paginate = {
        offset: isNaN(offset) ? 0 : offset,
        limit: isNaN(limit) ? 3 : limit,
      };

      const data = await getBookingStatusFilter(
        paginate,
        booking_status,
        userId
      );
      return res.status(200).json(data);

    } catch (err) {
      next(err);
    }
};

exports.getBookingByStatus = async (req, res, next) => {
    try {
      const { booking_no } = req.params;
      const userId = req.user.id;
      console.log(req.params);
      console.log(userId);
      const getBookingDetail = await db.Order.findOne({
        where: [{ booking_no: booking_no }, { user_id: userId }],
        include: [
          {
            model: db.Car,
            include: [
              {
                model: db.Image_car
              }
            ]
          }, {
            model: db.User,
            attributes: ['email', 'first_name', 'last_name', 'phone_number'],
          },{
            model: db.Billing,
          }
        ]
      });

      if (!getBookingDetail) {
        return res.status(400).json({
          message: 'Not found this booking.'
        });
      }

      return res.status(200).json({
        data: getBookingDetail
      });
    } catch (err) {
     next(err);
    }
};

exports.cancelBookingById = async (req, res, next) => {
    try {
      const { booking_no } = req.params;
      const userId = req.user.id;

      const getBookingData = await db.Order.findOne({
        where: {
          user_id: userId,
          booking_no: booking_no
        },
      });
      
      if (!getBookingData) {
        return res.status(400).json({
          message: 'Not found this booking.'
        });
      }

      getBookingData.booking_status = 'ยกเลิก';
      await getBookingData.save();
      res.status(201).json({
        message: 'ยกเลิกหมายเลิกการจองรถนี้'
      });
    } catch (err) {
      next(err);
    }
};