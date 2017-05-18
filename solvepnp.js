/**
 * Created by adamwang on 5/17/17.
 */

function PnPSolver(fx, fy, cx, cy) {
    this.fx = fx;
    this.fy = fy;
    this.cx = cx;
    this.cy = cy;
    this.inv_fx = 1.0 / fx;
    this.inv_fy = 1.0 / fy;
    this.cx_fx = cx / fx;
    this.cy_fy = cy / fy;

    this.solvePnP = function (objPoints, imgPoints, cameraMatrix, _distCoeff) {
        /*
         objPoints: 4 * 3 matrix
         imgPoints: 4 * 2 matrix
         cameraMatrix: 3 * 3 matrix
         distCoeff: 4 * 1 matrix
         */

        var rvec = vec3.create();
        var tvec = vec3.create();

        assert(objPoints.length == 4);
        assert(imgPoints.length == 4);

        var fx = getMatElement(cameraMatrix, 0, 0, 3), fy = getMatElement(cameraMatrix, 1, 1, 3);
        var cx = getMatElement(cameraMatrix, 0, 2, 3), cy = getMatElement(cameraMatrix, 1, 2, 3);

        return false;
    };

    this.solve4 = function (mu0, mv0, x0, y0, z0,
                    mu1, mv1, x1, y1, z1,
                    mu2, mv2, x2, y2, z2,
                    mu3, mv3, x3, y3, z3) {

        // rs: array of matrix 3x3, ts: array of vec3
        var n, rs = Array(4), ts = Array(4);
        [n, rs, ts] = this.solve3(mu0, mv0, x0, y0, z0,
            mu1, mv1, x1, y1, z1,
            mu2, mv2, x2, y2, z2);

        if (n === 0) {
            return false;
        }

        var ns = 0, min_reproj = 0.0;
        for (var i = 0; i < n; i++) {
            var x3p = getMatElement(rs[i], 0, 0, 3) * x3 + getMatElement(rs[i], 0, 1, 3) * y3 + getMatElement(rs[i], 0, 2, 3) * z3 + ts[i][0];
            var y3p = getMatElement(rs[i], 1, 0, 3) * x3 + getMatElement(rs[i], 1, 1, 3) * y3 + getMatElement(rs[i], 1, 2, 3) * z3 + ts[i][1];
            var z3p = getMatElement(rs[i], 2, 0, 3) * x3 + getMatElement(rs[i], 2, 1, 3) * y3 + getMatElement(rs[i], 2, 2, 3) * z3 + ts[i][2];
            var mu3p = cx + fx * x3p / z3p;
            var mv3p = cy + fy * y3p / z3p;
            var reproj = (mu3p - mu3) * (mu3p - mu3) + (mv3p - mv3) * (mv3p - mv3);

            if (i === 0 || min_reproj > reproj) {
                ns = i;
                min_reproj = reproj;
            }
        }

        var rotate = mat3.clone(rs[ns]);
        var translate = var3.clone(ts[ns]);

        // for(var i = 0; i < 9; i++) {
        //     rotate[i] = rs[ns][i];
        // }

        // for (var i = 0; i < 3; i++) {
        //     translate[i] = ts[ns][i];
        // }
        return true;
    };

    this.solve3 = function (mu0, mv0, x0, y0, z0,
                    mu1, mv1, x1, y1, z1,
                    mu2, mv2, x2, y2, z2) {

        var mk0, mk1, mk2, norm;

        mu0 = this.inv_fx * mu0 - this.cx_fx;
        mv0 = this.inv_fy * mv0 - this.cy_fy;
        norm = Math.sqrt(mu0 * mu0 + mv0 * mv0 + 1.0);
        mk0 = 1.0 / norm; mu0 *= mk0; mv0 *= mk0;

        mu1 = this.inv_fx * mu1 - this.cx_fx;
        mv1 = this.inv_fy * mv1 - this.cy_fy;
        norm = Math.sqrt(mu1 * mu1 + mv1 * mv1 + 1);
        mk1 = 1.0 / norm; mu1 *= mk1; mv1 *= mk1;

        mu2 = this.inv_fx * mu2 - this.cx_fx;
        mv2 = this.inv_fy * mv2 - this.cy_fy;
        norm = Math.sqrt(mu2 * mu2 + mv2 * mv2 + 1);
        mk2 = 1.0 / norm; mu2 *= mk2; mv2 *= mk2;

        var distances = Array(3);
        distances[0] = Math.sqrt((X1 - X2) * (X1 - X2) + (Y1 - Y2) * (Y1 - Y2) + (Z1 - Z2) * (Z1 - Z2));
        distances[1] = Math.sqrt((X0 - X2) * (X0 - X2) + (Y0 - Y2) * (Y0 - Y2) + (Z0 - Z2) * (Z0 - Z2));
        distances[2] = Math.sqrt((X0 - X1) * (X0 - X1) + (Y0 - Y1) * (Y0 - Y1) + (Z0 - Z1) * (Z0 - Z1));

        // Calculate angles
        var cosines = Array(3);
        cosines[0] = mu1 * mu2 + mv1 * mv2 + mk1 * mk2;
        cosines[1] = mu0 * mu2 + mv0 * mv2 + mk0 * mk2;
        cosines[2] = mu0 * mu1 + mv0 * mv1 + mk0 * mk1;

        // length is Array(vec3 * 4, len = 4)
        var n, lengths = Array(4);
        [n, lengths] = solve_for_lengths(distances, cosines);

        var nb_solutions = 0;
        // resultR 4 * 3 * 3 (4 * mat3), resultT 4 * 3 (4 * mat3)
        var resultR = Array(4), resultT = Array(4);

        for(var i = 0; i < n; i++) {
            // 3 * 3 matrix
            var M_orig = mat3.create();

            mat3.set(M_orig,
                lengths[i][0] * mu0,
                lengths[i][1] * mu1,
                lengths[i][2] * mu2,

                lengths[i][0] * mv0,
                lengths[i][1] * mv1,
                lengths[i][2] * mv2,

                lengths[i][0] * mk0,
                lengths[i][1] * mk1,
                lengths[i][2] * mk2
            );

            var outR = mat3.create(), outT = vec3.create(), res;
            [res, outR, outT] = align(M_orig, X0, Y0, Z0, X1, Y1, Z1, X2, Y2, Z2);

            // TODO: assign value to resultRT should be above this if?
            if (res === false) {
                continue;
            }

            resultR[nb_solutions] = outR;
            resultT[nb_solutions] = outT;
            nb_solutions++;
        }

        return nb_solutions;
     };

    this.solve_for_lengths = function (distances, cosines) {
    };

    // M_end: mat3
    this.align = function (M_end, X0, Y0, Z0, X1, Y1, Z1, X2, Y2, Z2) {

        // Centroids:
        var C_start = vec3.create(), C_end = vec3.create();
        for(var i = 0; i < 3; i++) {
            C_end[i] = (getMatElement(M_end, 0, i, 3), + getMatElement(M_end, 1, i, 3) + getMatElement(M_end, 2, i, 3)) / 3.0;
        }

        C_start[0] = (X0 + X1 + X2) / 3.0;
        C_start[1] = (Y0 + Y1 + Y2) / 3.0;
        C_start[2] = (Z0 + Z1 + Z2) / 3.0;

        // Covariance matrix s: mat3
        var s = Array(9);
        for(var j = 0; j < 3; j++) {
            s[0 * 3 + j] = (X0 * getMatElement(M_end, 0, j, 3) + X1 * getMatElement(M_end, 1, j, 3) + X2 * getMatElement(M_end, 2, j)) / 3 - C_end[j] * C_start[0];
            s[1 * 3 + j] = (Y0 * getMatElement(M_end, 0, j, 3) + Y1 * getMatElement(M_end, 1, j, 3) + Y2 * getMatElement(M_end, 2, j)) / 3 - C_end[j] * C_start[1];
            s[2 * 3 + j] = (Z0 * getMatElement(M_end, 0, j, 3) + Z1 * getMatElement(M_end, 1, j, 3) + Z2 * getMatElement(M_end, 2, j)) / 3 - C_end[j] * C_start[2];
        }

        var Qs = new jsfeat.matrix_t(4, 4, jsfeat.F32_t | jsfeat.C1_t);
        var W = new jsfeat.matrix_t(4, 1, jsfeat.F32_t | jsfeat.C1_t);
        var U = new jsfeat.matrix_t(4, 4, jsfeat.F32_t | jsfeat.C1_t);
        var V = new jsfeat.matrix_t(4, 4, jsfeat.F32_t | jsfeat.C1_t);        
            
        // Qs = Array(16), evs0 =  = Array(4), U0 = Array(16);

        Qs.data[0 * 4 + 0] = s[0 * 3 + 0] + s[1 * 3 + 1] + s[2 * 3 + 2];
        Qs.data[1 * 4 + 1] = s[0 * 3 + 0] - s[1 * 3 + 1] - s[2 * 3 + 2];
        Qs.data[2 * 4 + 2] = s[1 * 3 + 1] - s[2 * 3 + 2] - s[0 * 3 + 0];
        Qs.data[3 * 4 + 3] = s[2 * 3 + 2] - s[0 * 3 + 0] - s[1 * 3 + 1];

        Qs.data[1 * 4 + 0] = Qs[0 * 4 + 1] = s[1 * 3 + 2] - s[2 * 3 + 1];
        Qs.data[2 * 4 + 0] = Qs[0 * 4 + 2] = s[2 * 3 + 0] - s[0 * 3 + 2];
        Qs.data[3 * 4 + 0] = Qs[0 * 4 + 3] = s[0 * 3 + 1] - s[1 * 3 + 0];
        Qs.data[2 * 4 + 1] = Qs[1 * 4 + 2] = s[1 * 3 + 0] + s[0 * 3 + 1];
        Qs.data[3 * 4 + 1] = Qs[1 * 4 + 3] = s[2 * 3 + 0] + s[0 * 3 + 2];
        Qs.data[3 * 4 + 2] = Qs[2 * 4 + 3] = s[2 * 3 + 1] + s[1 * 3 + 2];

        jsfeat.linalg.svd_decompose(Qs, evs, U, V);
        var evs = W.data;
        // Looking for the largest eigen value:
        var i_ev = 0;
        var ev_max = evs[i_ev];
        for(var i = 1; i < 4; i++) {
            if (evs[i] > ev_max) {
                ev_max = evs[i_ev = i];
            }
        }

        // Quaternion:
        var q = Array(4);
        for(var i = 0; i < 4; i++)
            q[i] = U.data[i * 4 + i_ev];

        var q02 = q[0] * q[0], q12 = q[1] * q[1], q22 = q[2] * q[2], q32 = q[3] * q[3];
        var q0_1 = q[0] * q[1], q0_2 = q[0] * q[2], q0_3 = q[0] * q[3];
        var q1_2 = q[1] * q[2], q1_3 = q[1] * q[3];
        var q2_3 = q[2] * q[3];

        var R = mat3.create()
        // Already fix order problem here
        mat3.set(R,
            q02 + q12 - q22 - q32, 2. * (q1_2 + q0_3), 2. * (q1_3 - q0_2),
            2. * (q1_2 - q0_3), q02 + q22 - q12 - q32, 2. * (q2_3 + q0_1),
            2. * (q1_3 + q0_2), 2. * (q2_3 - q0_1), q02 + q32 - q12 - q22
        );
        // R[0][0] = q02 + q12 - q22 - q32;
        // R[0][1] = 2. * (q1_2 - q0_3);
        // R[0][2] = 2. * (q1_3 + q0_2);

        // R[1][0] = 2. * (q1_2 + q0_3);
        // R[1][1] = q02 + q22 - q12 - q32;
        // R[1][2] = 2. * (q2_3 - q0_1);

        // R[2][0] = 2. * (q1_3 - q0_2);
        // R[2][1] = 2. * (q2_3 + q0_1);
        // R[2][2] = q02 + q32 - q12 - q22;
        var T = vec3.create();
        
        for(var i = 0; i < 3; i++)
            // T[i] = C_end[i] - (R[i][0] * C_start[0] + R[i][1] * C_start[1] + R[i][2] * C_start[2]);
            T[i] = C_end[i] - (getMatElement(R, i, 0, 3) * C_start[0] + getMatElement(R, i, 1, 3) * C_start[1] + getMatElement(R, i, 2, 3) * C_start[2]);

        return true;
    }

}

